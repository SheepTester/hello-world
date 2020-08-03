// document.head.appendChild(document.createElement('script')).src = 'https://sheeptester.github.io/hello-world/ic-get-schedule.js'

async function main () {
  const classes = await fetch(
    '/campus/resources/portal/roster?_enableScheduleForGrades=true', {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache'
    }
  })
    .then(r => r.json())
    .then(arr => arr.map(({
      sectionID,
      courseName,
      teacherDisplay
    }) => ({
      sectionID,
      course: courseName,
      teacher: teacherDisplay
    })))
  for (const period of classes) {
    const {
      periods: [{ name }],
      terms: [{ termName }]
    } = await fetch(
      `/campus/resources/portal/section/${period.sectionID}?_expand=course-school&_expand=terms&_expand=periods-periodSchedule&_expand=teacherPreference&_expand=room&_expand=teachers`,       {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache'
        }
      })
        .then(r => r.json())
    delete period.sectionID
    period.period = name
    period.semester = termName
  }
  return classes
    .sort((a, b) => +a.period - +b.period)
    .map(({ period, semester, course, teacher }) => `${semester} ${period}: ${teacher} / ${course}`)
    .join('\n')
}

main()
  .then(console.log)
