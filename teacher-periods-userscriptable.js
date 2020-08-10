// document.head.appendChild(document.createElement('script')).src = 'https://sheeptester.github.io/hello-world/teacher-periods-userscriptable.js'

document.head.appendChild(Object.assign(document.createElement('script'), {
  src: 'https://sheeptester.github.io/hello-world/ic-scrape-sections.js',
  async onload () {
    const alwaysRefetchSections = false

    let sections = window.lastSections
    if (alwaysRefetchSections || !sections) {
      console.log('Loading... (this takes a while, probably)')
      sections = await main(3)
      window.lastSections = sections
    }

    const teachers = {}

    function noteTeacher (teacher, period, course, semesters) {
      if (!teachers[teacher.email]) {
        teachers[teacher.email] = {
          lastName: teacher.lastName,
          semesters: {}
        }
      }
      for (const semester of semesters) {
        if (!teachers[teacher.email].semesters[semester]) {
          teachers[teacher.email].semesters[semester] = {}
        }
        teachers[teacher.email].semesters[semester][period] = course
      }
    }

    for (const {
      teachers,
      periods: [{ name: period }],
      courseName: course,
      terms: semesters
    } of Object.values(sections)) {
      for (const teacher of teachers) {
        noteTeacher(teacher, period, course, semesters.map(sem => sem.termName))
      }
    }

    const output = Object.values(teachers)
      .sort((a, b) => a.lastName < b.lastName ? -1 : 1)
      .map(({ semesters, lastName }) => {
        const periods = [...new Set([].concat(...Object.values(semesters).map(Object.keys)))].sort()
        const semesterNames = Object.keys(semesters).sort()
        const table = [['', ...semesterNames]]
        for (const period of periods) {
          table.push([period, ...semesterNames.map(sem => semesters[sem][period] || '')])
        }
        const minWidth = new Array(table[0].length).fill(0)
        for (const row of table) {
          row.forEach(({ length }, i) => {
            if (length > minWidth[i]) minWidth[i] = length
          })
        }
        return [
          lastName,
          ...table.map((row, i) => {
            const str = row
              .map((item, i) => item.padEnd(minWidth[i], ' '))
              .join(' | ')
            if (i === 0) {
              return str +
                '\n' +
                row
                  .map((_, i) => '-'.repeat(minWidth[i]))
                  .join('-+-')
            } else {
              return str
            }
          })
        ].join('\n')
      })
      .join('\n\n')
    window.lastOutput = output
    console.log(output)
    alert(output)
  }
}))
