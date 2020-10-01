const fs = require('fs/promises')

const [{ teachers: teacherData }, ...sections] = require('./sections-simplified.json')

const periods = [...'12345678', 'SELF', 'Meetings']

function createNewSchedule () {
  return Object.fromEntries(periods.map(p => [p, []]))
}

const teachers = {}

function noteTeacher (teacher, period, course, semester) {
  // Some teachers don't have emails
  const teacherId = teacher.email || teacher.lastName
  if (!teachers[teacherId]) {
    teachers[teacherId] = {
      ...teacher,
      semester1: createNewSchedule(),
      semester2: createNewSchedule()
    }
  }
  if (semester & 0b01) {
    teachers[teacherId].semester1[period].push(course)
  }
  if (semester & 0b10) {
    teachers[teacherId].semester2[period].push(course)
  }
}

for (const {
  teachers: teacherDisplay,
  periods: periodStr,
  name: course,
  semester
} of sections) {
  const [period] = periodStr.split(' / ')
  const { teacher, coteacher } = teacherData[teacherDisplay] || {}
  const sem = (semester.includes('S1') ? 0b01 : 0) | (semester.includes('S2') ? 0b10 : 0)
  if (teacher) noteTeacher(teacher, period, course, sem)
  if (coteacher) noteTeacher(coteacher, period, course, sem)
}

for (const teacher of Object.values(teachers)) {
  for (const sem of ['semester1', 'semester2']) {
    const semester = teacher[sem]
    for (const period of Object.keys(semester)) {
      semester[period] = semester[period].join(', ') || null
    }
  }
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
