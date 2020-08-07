const fs = require('fs/promises')

const { sections } = require('./sections-simplified.json')

const periods = [...'12345678', 'SELF', 'Meetings']

function createNewSchedule () {
  return Object.fromEntries(periods.map(p => [p, null]))
}

const teachers = {}

function noteTeacher (teacher, period, course, semester) {
  if (!teachers[teacher.email]) {
    teachers[teacher.email] = {
      ...teacher,
      semester1: createNewSchedule(),
      semester2: createNewSchedule()
    }
  }
  if (semester & 0b01) {
    teachers[teacher.email].semester1[period] = course
  }
  if (semester & 0b10) {
    teachers[teacher.email].semester2[period] = course
  }
}

for (const {
  teacher,
  coteacher,
  period: { name: period },
  name: course,
  semester
} of sections) {
  const sem = (semester.includes('S1') ? 0b01 : 0) | (semester.includes('S2') ? 0b10 : 0)
  if (teacher) noteTeacher(teacher, period, course, sem)
  if (coteacher) noteTeacher(coteacher, period, course, sem)
}

fs.writeFile(
  './teacher-periods.txt',
  Object.values(teachers)
    .sort((a, b) => a.lastName < b.lastName ? -1 : 1)
    .map(({ semester1, semester2, lastName }) => {
      const table = []
      let hasClasses = false
      for (const period of '1234567') {
        if (!hasClasses && (semester1[period] || semester2[period])) {
          hasClasses = true
        }
        table.push([period, semester1[period], semester2[period]])
      }
      if (semester1['8'] || semester2['8']) {
        hasClasses = true
        table.push(['8', semester1['8'], semester2['8']])
      }
      const hasSelf = semester1['SELF'] || semester2['SELF']
      const hasMeetings = semester1['Meetings'] || semester2['Meetings']
      const minCol2Width = table
        .map(([, col2]) => col2 ? col2.length : 0)
        .reduce((acc, curr) => Math.max(acc, curr))
      return [
        lastName,
        ...(hasClasses ? table.map(([period, sem1, sem2]) => {
          return `${period} | ${
            (sem1 || '').padEnd(minCol2Width, ' ')
          } | ${sem2 || ''}`
        }) : ['No classes']),
        `SELF ${hasSelf ? '⭕' : '❌'} | Counseling ${hasMeetings ? '⭕' : '❌'}`
      ].join('\n')
    })
    .join('\n\n')
)
