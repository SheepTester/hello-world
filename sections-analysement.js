const util = require('util')
const fs = require('fs/promises')

// See ic-scrape-sections.js
const sections = Object.values(require('../../test/sections-5.json'))

function analyseFrequency (key, value, freqTarget) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      if (!freqTarget[key]) freqTarget[key] = []
      value.forEach((v, i) => {
        analyseFrequency(i, v, freqTarget[key])
      })
    } else {
      if (!freqTarget[key]) freqTarget[key] = {}
      for (const [k, v] of Object.entries(value)) {
        analyseFrequency(k, v, freqTarget[key])
      }
    }
  } else {
    if (!freqTarget[key]) freqTarget[key] = new Map()
    freqTarget[key].set(value, (freqTarget[key].get(value) || 0) + 1)
  }
}

function mapJson (value, mapFn) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(item => mapJson(item, mapFn))
    } else if (Object.getPrototypeOf(value) === Object.prototype) {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, mapJson(val, mapFn)])
      )
    }
  }
  return mapFn(value)
}

function limit (strings, max = 20) {
  if (strings.length > max) {
    const showing = max - 1
    const spacing = Math.floor(strings.length / showing)
    const sample = []
    for (let i = 0; i < showing; i++) {
      sample.push(strings[spacing * i])
    }
    return sample.join('\n') + `\n[${strings.length} total]`
  } else {
    return strings.join('\n')
  }
}

function sampling (sections) {
  return limit(
    sections.map(sec => `[${sec.id}] ${sec.teacherDisplay}: ${sec.courseName}`),
    10
  ) + '\n'
}

const frequencies = {}
for (const section of sections) {
  analyseFrequency('sections', section, frequencies)
}
console.log(
  // https://stackoverflow.com/a/10729284
  util.inspect(
    mapJson(
      frequencies,
      value => value instanceof Map && value.size > 20 ? 'UNIQUE' : value
    ),
    false,
    null,
    true
  )
)

console.log(
  // Mostly Counseling but also "Zavack, Kate: AmerLit 11" for some reason
  '> courseAttendance is false for\n' +
    sampling(sections.filter(section => !section.courseAttendance))
)
console.log(
  // "Zavack, Kate: AmerLit 11" "Kompella, Jacintha: AP Physics C" and Prep
  // 11/12
  '> courseAttendance is false and name isn\'t Counseling for\n' +
    sampling(
      sections.filter(
        section => !section.courseAttendance &&
          section.courseName !== 'Counseling'
      )
    )
)
console.log(
  // Ind Study
  '> gpaWeight is 1 for\n' +
    sampling(sections.filter(section => section.course.gpaWeight === 1))
)
console.log(
  // Mostly SELF and some Counseling
  '> gpaWeight is 0 for\n' +
    sampling(sections.filter(section => section.course.gpaWeight === 0))
)
console.log(
  // Counseling
  '> isNonInstructional is true for\n' +
    sampling(sections.filter(section => section.periods[0]?.isNonInstructional))
)
console.log(
  // A variety of classes, presumably co-taught
  '> lunchMinutes is 30 for\n' +
    sampling(sections.filter(section => section.periods[0]?.lunchMinutes === 30))
)
console.log(
  // In reality, most of the above classes are actually taught by a single
  // teacher! Quite odd.
  '> lunchMinutes is 30 and teachers.length is 1 for\n' +
    sampling(
      sections.filter(
        section => section.periods[0]?.lunchMinutes === 30 &&
          section.teachers.length === 1
      )
    )
)
console.log(
  // A variety of classes
  '> teachers.length is 0 for\n' +
    sampling(sections.filter(section => section.teachers.length === 0))
)
console.log(
  // A variety of classes
  // It doesn't exist for "SchServ 11" "Gen Weep11" and preps
  '> teachers.length is 0 and teacherDisplay exists for\n' +
    sampling(
      sections.filter(
        section => section.teacherDisplay && section.teachers.length === 0
      )
    )
)
console.log(
  '> period.name is different for\n' +
    sampling(
      sections.filter(
        section => {
          for (const { name } of section.periods.slice(1)) {
            if (name !== section.periods[0].name) return true
          }
          return false
        }
      )
    )
)
console.log(
  '> periods.length is 0 for\n' +
    sampling(
      sections.filter(
        section => section.periods.length === 0
      )
    )
)

const outPath = './sections-simplified.json'
function toTeacher ({
  email,
  firstName,
  lastName,
  workPhone,
  workPhoneUri,
  middleName
}) {
  return {
    firstName,
    middleName,
    lastName,
    email: email && email.replace('@pausd.org', ' etc'),
    workPhone
  }
}
const descriptions = {}
const teacherMap = {}
const periodTimes = {}
const simplified = sections.map(({
  id,
  // courseAttendance,
  courseName,
  courseNumber,
  number,
  teacherDisplay, // Apparently `teachers` can be empty
  course: {
    description,
    // gpaWeight,
    honorsCode,
    transcript
  },
  periods,
  teachers,
  terms: [
    { termName: termName1 } = {},
    { termName: termName2 = '' } = {}
  ]
}) => {
  const [primary, secondary] = [...teachers]
    .sort((a, b) => b.isPrimaryTeacher - a.isPrimaryTeacher)
  if (primary || secondary) {
    const data = {
      teacher: primary ? toTeacher(primary) : undefined,
      coteacher: secondary ? toTeacher(secondary) : undefined,
    }
    if (teachers[teacherDisplay] && JSON.stringify(teachers[teacherDisplay]) !== JSON.stringify(data)) {
      console.warn(`Multiple teacher data for ${courseNumber} (${teacherDisplay}):`, teachers[teacherDisplay], data)
    } else {
      teacherMap[teacherDisplay] = data
    }
  }
  if (descriptions[courseNumber]) {
    if (description && descriptions[courseNumber] !== description) {
      console.log(`Multiple descriptions for ${courseNumber}:\n> ${descriptions[courseNumber]}\n> ${description}\n`)
    }
  } else {
    descriptions[courseNumber] = description
  }
  const periodNames = new Set()
  for (const {
    endTime,
    // isNonInstructional,
    // isStandardDay,
    lunchMinutes,
    name,
    passingMinutes,
    periodMinutes,
    periodSchedule: { name: periodSchedule },
    startTime
  } of periods) {
    const obj = { startTime, endTime, periodMinutes, passingMinutes, lunchMinutes }
    if (!periodTimes[name]) {
      periodTimes[name] = {}
    }
    if (periodTimes[name][periodSchedule]) {
      if (JSON.stringify(periodTimes[name][periodSchedule]) !== JSON.stringify(obj)) {
        console.warn(`Period info is different from ${courseNumber} (old, new):`, periodTimes[name][periodSchedule], obj)
      }
    } else {
      periodTimes[name][periodSchedule] = obj
    }
    periodNames.add(name)
  }
  return {
    sectionID: id,
    name: courseName,
    courseNumber,
    teachers: teacherDisplay,
    periods: [...periodNames].join(' / '),
    semester: termName1 + termName2,
    other: [
      'HC: ' + (honorsCode || '-'),
      'T? ' + (transcript ? 'Y' : 'N'),
      'N: ' + number
    ].join(' | ')
  }
})
fs.writeFile(
  outPath,
  JSON.stringify([
    {
      descriptions,
      teachers: teacherMap,
      periods: periodTimes
    },
    ...simplified
  ], null, '\t') + '\n'
).then(() => {
  console.log(`Wrote to ${outPath}`)
})
