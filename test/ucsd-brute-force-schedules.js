// Brute force generate every possible schedule, filter out those with
// overlapping times, then sort the classes by "ideal-ness" (commute times
// between buildings)

// Run this in the browser console at https://act.ucsd.edu/webreg2/main
//
// Note: You'll have to select the term first; I think it saves it in a cookie
// or smth

bruteForce(
  // Array of course names or an array of a course name and alternates
  ['cat 1', 'math 18', 'math 20c', ['cse 11', 'cse 8b'], 'ece 15'],
  'FA21'
)

/**
 * @param {(string | string[])[]} rawCourseNames
 * @param {string} term
 */
async function bruteForce (rawCourseNames, term) {
  /** @param {string} str */
  function normalise (str) {
    return str.replace(/\s+/g, '').toLowerCase()
  }

  /**
   * @template T
   * @param {T[][]} choicesList
   * @yields {T[]}
   * @returns {Generator<T[]>}
   */
  function * combinations (choicesList) {
    if (choicesList.length > 0) {
      const [choices, ...rest] = choicesList
      for (const combination of combinations(rest)) {
        for (const choice of choices) {
          yield [choice, ...combination]
        }
      }
    } else {
      yield []
    }
  }

  /** @type {string[][]} */
  const courseNames = rawCourseNames.map(course =>
    Array.isArray(course) ? course.map(normalise) : [normalise(course)]
  )
  const courseNamesToGet = new Set(courseNames.flat())

  // Times determined by https://maps.ucsd.edu/map/default.htm; I hear they're
  // inaccurate, but whatever
  /** @type {Record<string, Record<string, number>>} */
  const distances = {
    MOS: {
      CENTR: 9,
      APM: 3,
      PCYNH: 13,
      WLH: 10
    }
  }

  /** @type {CourseSearchResult[]} */
  const rawCourseData = await fetch(
    'https://act.ucsd.edu/webreg2/svc/wradapter/secure/search-by-all?' +
      new URLSearchParams({
        subjcode: '',
        crsecode: '',
        department: '',
        professor: '',
        title: '',
        levels: '',
        days: '',
        timestr: '',
        opensection: false,
        isbasic: true,
        basicsearchvalue: '',
        termcode: term
      })
  ).then(r => r.json())
  /** @type {Record<string, CourseSearchResult & HasParsedGroups>} */
  const courseData = {}
  for (const course of rawCourseData) {
    const courseCode = `${course.SUBJ_CODE.trim()} ${course.CRSE_CODE.trim()}`
    const normalisedId = normalise(courseCode)
    if (courseNamesToGet.has(normalisedId)) {
      /** @type {GroupDatum[]} */
      const groupData = await fetch(
        'https://act.ucsd.edu/webreg2/svc/wradapter/secure/search-load-group-data?' +
          new URLSearchParams({
            subjcode: course.SUBJ_CODE,
            crsecode: course.CRSE_CODE,
            termcode: term
          })
      ).then(r => r.json())
      /**
       * Map of lecture letters (eg "A") to a map of group tyoes to a list of
       * groups per type.
       * @type {Record<string, Record<'LE' | 'DI' | 'LA', ParsedGroup[]>>}
       */
      const groups = {}
      for (const group of groupData) {
        const start = group.BEGIN_HH_TIME * 60 + group.BEGIN_MM_TIME
        const end = group.END_HH_TIME * 60 + group.END_MM_TIME
        const days = Array.from(group.DAY_CODE, Number)
        const building = group.BLDG_CODE.trim()
        const letter = group.SECT_CODE.match(/[a-z]+/i)[0]
        // Ignore TBA periods
        if (start === 0 && end === 0) continue
        if (
          group.FK_SPM_SPCL_MTG_CD === ' ' ||
          group.FK_SPM_SPCL_MTG_CD === '  '
        ) {
          if (['LE', 'DI', 'LA'].includes(group.FK_CDI_INSTR_TYPE)) {
            if (!groups[letter]) {
              groups[letter] = {}
            }
            if (!groups[letter][group.FK_CDI_INSTR_TYPE]) {
              groups[letter][group.FK_CDI_INSTR_TYPE] = []
            }
            groups[letter][group.FK_CDI_INSTR_TYPE].push({
              code: `${courseCode}: ${group.SECT_CODE}`,
              start,
              end,
              days,
              building: building === 'TBA' ? null : building
            })
          } else {
            throw new Error(
              `Unexpected "fuxk CDI instruction type": "${group.FK_CDI_INSTR_TYPE}"`
            )
          }
        } else if (
          group.FK_SPM_SPCL_MTG_CD === 'FI' ||
          group.FK_SPM_SPCL_MTG_CD === 'MI'
        ) {
          // Not going to deal with finals for now
        } else {
          throw new Error(
            `Unexpected "xuck spam special meeting CD": "${group.FK_SPM_SPCL_MTG_CD}"`
          )
        }
      }
      courseData[normalisedId] = { ...course, groups }
    }
  }

  /**
   * @param {{ lectures: ParsedGroup[][][] }[]} courses
   * @param {Schedule} parentSchedule
   * @yields {Schedule}
   * @returns {Generator<Schedule>}
   */
  function * groupCombinations (courses, parentSchedule) {
    if (courses.length > 0) {
      const [{ lectures }, ...rest] = courses
      // For each letter (A, B, C, ...)
      for (const lecture of lectures) {
        // Consider every combination of lecture to discussion
        groups: for (const groups of combinations(lecture)) {
          // Add lecture and discussion groups to schedule
          const schedule = parentSchedule.map(day => day.slice())
          for (const group of groups) {
            for (const day of group.days) {
              if (
                // Give up if I find a period that already overlaps
                schedule[day].find(
                  period =>
                    period.start <= group.end && group.start <= period.end
                )
              ) {
                continue groups
              }
              schedule[day].push(group)
            }
          }
          // This group option is compatible with the parent schedule. Proceed!
          yield * groupCombinations(rest, schedule)
        }
      }
    } else {
      yield parentSchedule
    }
  }

  /**
   * @yields {Schedule}
   * @returns {Generator<Schedule>}
   */
  function * getPossibleSchedules () {
    for (const courseCombo of combinations(courseNames)) {
      const groupPossibilities = courseCombo
        .flatMap(name => {
          // A list of lectures/letters each with a list of lists of groups
          // split by type. This is a mess.
          const lectures = Object.values(courseData[name].groups).map(groups =>
            Object.values(groups)
          )
          return {
            lectures,
            count: lectures.flat(2).length
          }
        })
        .sort((a, b) => a.count - b.count)
      yield * groupCombinations(
        groupPossibilities,
        Array.from({ length: 8 }, () => [])
      )
    }
  }

  const days = ' Mon Tue Wed Thu Fri Sat Sun'.split(' ')

  /** @param {Schedule} schedule */
  function displaySchedule (schedule) {
    const scale = 2.5 // 2.5 min per char
    const minTime = Math.min(
      ...schedule.flatMap(day => day.map(group => group.start))
    )
    const maxTime = Math.max(
      ...schedule.flatMap(day => day.map(group => group.end))
    )
    const startHour = Math.floor(minTime / 60)
    const endHour = Math.floor(maxTime / 60)
    let chars = ' '.repeat((maxTime - minTime) / scale)
    for (let hour = startHour; hour <= endHour; hour++) {
      const display = `${hour.toString().padStart(2, '0')}:00 ->`
      const index = Math.floor((hour * 60 - minTime) / scale)
      if (index < 0) continue
      chars =
        chars.slice(0, index) + display + chars.slice(index + display.length)
    }
    let output = `KEY ${chars}`
    for (let i = 1; i <= 7; i++) {
      const chars = new Array((maxTime - minTime) / scale).fill(' ')
      for (const { start, end, code } of schedule[i].sort(
        (a, b) => a.start - b.start
      )) {
        const name = code + ' | '
        const startIndex = Math.floor((start - minTime) / scale)
        const endIndex = Math.floor((end - minTime) / scale)
        for (let i = startIndex; i < endIndex; i++) {
          chars[i] =
            i === startIndex ? '[' : name[(i - startIndex - 1) % name.length]
        }
        chars[endIndex - 2] = '…'
        chars[endIndex - 1] = ']'
      }
      output += `\n${days[i]} ${chars.join('')}`
    }
    console.log(output)
    if (!window.displayed) {
      window.displayed = document.createElement('pre')
      Object.assign(window.displayed.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        whiteSpace: 'pre',
        overflow: 'auto'
      })
      document.body.append(window.displayed)
    }
    window.displayed.textContent = output
  }

  const schedules = [...getPossibleSchedules()]
  displaySchedule(schedules[Math.floor(Math.random() * schedules.length)])

  const locals = {
    rawCourseNames,
    term,
    normalise,
    combinations,
    courseNames,
    courseNamesToGet,
    distances,
    rawCourseData,
    courseData,
    groupCombinations,
    getPossibleSchedules,
    days,
    displaySchedule,
    schedules
  }
  Object.assign(globalThis, locals)
  return locals
}

/**
 * @typedef {Object} CourseSearchResult
 * @property {number} UNIT_TO - Maximum units given??
 * @property {string} SUBJ_CODE - The "CSE" in "CSE 11." May have whitespace
 * around sides.
 * @property {number} UNIT_INC - No idea
 * @property {string} CRSE_TITLE - The name of the course
 * @property {number} UNIT_FROM - Minimum units given?? Complements `UNIT_TO`.
 * @property {string} CRSE_CODE - The "20C" in "MATH 20C.". May have whitespace
 * around sides.
 */

/**
 * Includes lectures, discussions, labs, etc. If the time is TBA, then the
 * start/end times are all 0. The room and building codes will be "TBA."
 * @typedef {Object} GroupDatum
 * @property {number} END_MM_TIME - Minute hand of the end time
 * @property {number} SCTN_CPCTY_QTY - Capacity of the section
 * @property {string} LONG_DESC - Apparently always just a space (" ").
 * @property {number} SCTN_ENRLT_QTY - Number of people already enrolled
 * @property {number} BEGIN_HH_TIME - Hour hand of the start time
 * @property {string} SECTION_NUMBER - 6-digit number (including leading zeroes)
 * @property {string} SECTION_START_DATE - YYYY-MM-DD, same for all groups it
 * seems
 * @property {'Y' | 'N'} STP_ENRLT_FLAG - Whether to prevent enrolment (usually
 * means it's full I think)
 * @property {string} SECTION_END_DATE - YYYY-MM-DD, complements
 * `SECTION_START_DATE`
 * @property {number} COUNT_ON_WAITLIST - Number of people on the waitlist
 * @property {'Y' | 'N'} PRIMARY_INSTR_FLAG - Whether the listed teacher name
 * (see `PERSON_FULL_NAME`) is the primary instructor?
 * @property {string} BEFORE_DESC - Also always just a space (" ") it seems. See
 * `LONG_DESC`.
 * @property {string} ROOM_CODE - The room number. May have whitespace around
 * sides. Example: "004 "
 * @property {number} END_HH_TIME - Hour hand of the end time; complements
 * `END_MM_TIME`
 * @property {string} START_DATE - YYYY-MM-DD, is different for finals (if
 * `FK_SPM_SPCL_MTG_CD` is "FI")
 * @property {string} DAY_CODE - Digits 1-7 in a string of the days of the week.
 * For example, "135" is Monday-Wednesday-Friday.
 * @property {number} BEGIN_MM_TIME - Minute hand of the start time; complements
 * `BEGIN_HH_TIME`
 * @property {string} PERSON_FULL_NAME - Teacher's full name
 * @property {' ' | '  ' | 'FI' | 'MI'} FK_SPM_SPCL_MTG_CD - Whether the group
 * represents the time and date of the final exam. Maybe this is to determine
 * alternate schedules or something. There could be more values than just "FI."
 * @property {string} PRINT_FLAG - Always " " it seems
 * @property {string} BLDG_CODE - The abbreviation (eg "WLH ") of the building;
 * may have surrounding whitespace.
 * @property {'AC' | 'NC'} FK_SST_SCTN_STATCD - ¯\_(ツ)_/¯
 * @property {'DI' | 'LE' | 'LA'} FK_CDI_INSTR_TYPE - Whether it's a discussion
 * or lecture or lab. There's probably more values than just this.
 * @property {string} SECT_CODE - A capital letter followed by two digits (eg
 * "A01"). The digits tend to be 00 for lectures and 50 for labs, it seems.
 * @property {number} AVAIL_SEAT - Available spots left. Should be equal to
 * `SCTN_CPCTY_QTY - SCTN_ENRLT_QTY`.
 */

/**
 * @typedef {Object} ParsedGroup
 * @property {string} code
 * @property {number} start
 * @property {number} end
 * @property {number[]} days
 * @property {string | null} building
 */

/**
 * @typedef {Object} HasParsedGroups
 * @property {Record<string, Record<'LE' | 'DI' | 'LA', ParsedGroup[]>>} groups
 */

/**
 * Mapping between day ID (1-7) to a list of groups (not necessarily in
 * chronological order), so index 0 isn't used.
 * @typedef {ParsedGroup[][]} Schedule
 */
