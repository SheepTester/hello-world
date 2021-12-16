// Opens a new window with a table you can paste into Google Sheets
// Run in the console on the People tab of a course page, like https://canvas.ucsd.edu/courses/31030/users

const users = []
let page = 1
let results
do {
  results = await fetch(`https://canvas.ucsd.edu/api/v1/courses/${ENV.course.id}/users?${
    new URLSearchParams([
      ['include[]', 'avatar_url'],
      ['include[]', 'enrollments'],
      ['include_inactive', true],
      ['page', page++],
      ['per_page', 100],
    ])
  }`)
    .then(r => r.json())
  users.push(...results)
} while (results.length > 0)

const courseName = ENV.CONTEXTS.courses[ENV.course.id].name
const sections = {}
for (const { id, name } of ENV.SECTIONS) {
  sections[id] = { name, users: [] }
}
for (const {
  id,
  name,
  avatar_url: avatar,
  enrollments: [{ course_section_id: sectionId }]
} of users) {
  sections[sectionId].users.push({
    avatar: avatar === 'https://canvas.ucsd.edu/images/messages/avatar-50.png' ? null : avatar,
    name,
    id
  })
}

let win
do {
  if (win) {
    await new Promise(resolve => {
      document.addEventListener('click', resolve, { once: true })
      alert('Please click the page!')
    })
  }
  win = window.open('about:blank')
} while (!win.document)
win.document.documentElement.innerHTML = `<h1>${courseName}</h1><table>${
  Object.values(sections)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(({ name, users }) => `<tr><th colspan="2">${name}</th></tr>${
    users
    .map(({ avatar, name, id }) => `<tr><td>${
      avatar ? `<img src="${avatar}" /><span>=IMAGE(${JSON.stringify(avatar)})</span>` : ''
    }</td><td><a href="https://canvas.ucsd.edu/about/${id}">${name}</a></td></tr>`)
    .join('')
  }`)
  .join('')
}</table><style>table{border-collapse:collapse}th,td{border:1px solid black}img{width:48px}span{font-size:1px}</style>`
win.document.title = courseName
