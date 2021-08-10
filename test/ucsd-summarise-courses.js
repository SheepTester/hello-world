// https://act.ucsd.edu/webreg2/main?p1=FA21&p2=UN#tabs-1

// change this list to your own courses
IDEAL = 'ece 15, cse 11, math 18, math 20c, cat 1'
  .split(/\s*,\s*/)
  .map(normalise)
TERM = 'FA21'

function normalise(str) {
  return str
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
}
days = ' Mon Tue Wed Thu Fri Sat Sun'.split(' ')
fmtTime = (hr, min) =>
  `${hr.toString().padStart(2, 0)}:${min.toString().padStart(2, 0)}`
courses = await fetch(
  'https://act.ucsd.edu/webreg2/svc/wradapter/secure/search-by-all?subjcode=&crsecode=&department=&professor=&title=&levels=&days=&timestr=&opensection=false&isbasic=true&basicsearchvalue=&termcode=' +
    TERM
).then((r) => r.json())
found = courses.filter(({ SUBJ_CODE, CRSE_CODE }) => {
  normalised = normalise(`${SUBJ_CODE} ${CRSE_CODE}`)
  return IDEAL.some((m) => normalised === m)
})
html = '<table><tr><th>Course</th><th>Lectures</th><th>Discussions</th></tr>'
for (const obj of found) {
  //html += `<tr><td>${obj.CRSE_TITLE}`
  obj.sections = await fetch(
    'https://act.ucsd.edu/webreg2/svc/wradapter/secure/search-load-group-data?' +
      new URLSearchParams({
        subjcode: obj.SUBJ_CODE,
        crsecode: obj.CRSE_CODE,
        termcode: TERM,
      })
  ).then((r) => r.json())
  obj.prereqs = await fetch(
    'https://act.ucsd.edu/webreg2/svc/wradapter/secure/get-prerequisites?' +
      new URLSearchParams({
        subjcode: obj.SUBJ_CODE,
        crsecode: obj.CRSE_CODE,
        termcode: TERM,
      })
  ).then((r) => r.json())
  const sections = []
  for (const {
    BEGIN_HH_TIME,
    BEGIN_MM_TIME,
    BLDG_CODE,
    PERSON_FULL_NAME, // has semicolon
    SECT_CODE, // good juice
    END_HH_TIME,
    END_MM_TIME,
    FK_CDI_INSTR_TYPE, // to double check
    AVAIL_SEAT,
    SCTN_CPCTY_QTY,
    FK_SPM_SPCL_MTG_CD,
    DAY_CODE,
  } of obj.sections) {
    ;[, letter, number] = SECT_CODE.match(/([A-Z]+)(\d+)/)
    if (!sections[letter]) {
      sections[letter] = {
        discussions: [],
      }
    }
    const wow = {
      start: fmtTime(BEGIN_HH_TIME, BEGIN_MM_TIME),
      end: fmtTime(END_HH_TIME, END_MM_TIME),
      loc: BLDG_CODE.trim(),
      left: `${AVAIL_SEAT}/${SCTN_CPCTY_QTY}`,
      dayCode: DAY_CODE,
      days: [...DAY_CODE].map((d) => days[d]).join(', '),
      // todo: days
    }
    // ignore finals and midterms and labs
    if (FK_SPM_SPCL_MTG_CD === 'FI') continue
    if (FK_SPM_SPCL_MTG_CD === 'MI') continue
    if (FK_CDI_INSTR_TYPE === 'LA') continue
    // idk
    if (FK_SPM_SPCL_MTG_CD !== '  ') throw 'special meeting is not empty'
    if (number === '00') {
      if (FK_CDI_INSTR_TYPE !== 'LE') throw '00 is not LE'
      sections[letter].teacher = PERSON_FULL_NAME.split(';')[0]
      sections[letter].lecture = wow
    } else if (FK_CDI_INSTR_TYPE !== 'LA') {
      // idk how to deal with LA (lab)
      if (FK_CDI_INSTR_TYPE !== 'DI') throw '>00 is not DI'
      sections[letter].discussions.push({ ...wow, number })
    }
  }

  obj.processed = sections
  obj.totDiscussions = Object.values(sections)
    .map(({ discussions }) => discussions.length)
    .reduce((acc, curr) => acc + curr)
  //html += '</tr>'
}

ff = ({
  totDiscussions,
  prereqs,
  processed,
  CRSE_TITLE,
  CRSE_CODE,
  SUBJ_CODE,
}) => {
  entries = Object.entries(processed).sort((a, b) => a[0].localeCompare(b[0]))
  return entries
    .map(
      ([letter, { teacher, lecture, discussions }], i) =>
        `<tr>${
          // course name
          i === 0
            ? `<td rowspan="${
                entries.length
              }" style="border-top: 1px solid black; padding: 0 10px;"><strong>${SUBJ_CODE.trim()} ${CRSE_CODE.trim()}: ${CRSE_TITLE}</strong>${
                prereqs.length
                  ? `<p>Prerequisites:</p><ul>${prereqs
                      .map(
                        (req) =>
                          `<li>${
                            req.TYPE === 'TEST'
                              ? `(test) ${req.TEST_TITLE}`
                              : req.TYPE === 'COURSE'
                              ? `(course) ${req.CRSE_TITLE}`
                              : `(${req.TYPE} ???)`
                          }</li>`
                      )
                      .join('')}</ul>`
                  : '<p><em>No prerequisites</em></p>'
              }</td>`
            : ''
        }<td style="border-top: 1px solid black;padding: 0 10px;"><strong>${letter}</strong><br>${
          lecture.days
        }<br>${lecture.start}&ndash;${lecture.end} @ ${
          lecture.loc
        }</td><td style="border-top: 1px solid black; padding: 0 10px;">${discussions
          .sort(
            (a, b) =>
              a.dayCode.localeCompare(b.dayCode) ||
              a.start.localeCompare(b.start) ||
              a.loc.localeCompare(b.loc)
          )
          .map(
            ({ start, end, days, loc, left, number }, j) =>
              `<strong>${number}</strong> ${days} ${start}&ndash;${end} @ ${loc} <span style="font-size: smaller;">(${left} left)</span>`
          )
          .join('<br>')}</td></tr>`
    )
    .join('')
}
console.log(
  `data:text/html;charset=UTF-8,${encodeURIComponent(
    `<table style="border-collapse: collapse;"><tbody style="vertical-align:top"><tr><th>Course</th><th>Lectures</th><th>Discussions</th></tr>${found
      .sort((a, b) => a.totDiscussions - b.totDiscussions)
      .map(ff)
      .join('')}</tbody></table>`
  )}`
)
