// https://pausd.schoology.com/event/5116716079/profile
// https://pausd.schoology.com/event/5116716079/view/members/3?page=0

{
const parser = new DOMParser()
const students = []
const defaultPfp = 'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/images/user-default.svg'
window.students = students
let lastFirstId
outer:
for (let i = 0; true; i++) {
  const doc = await fetch(`https://pausd.schoology.com/event/5116716079/view/members/3?page=${i}`)
    .then(r => r.text())
    .then(html => parser.parseFromString(html, 'text/html'))
  let first = true
  for (const member of doc.querySelectorAll('.enrollment-member')) {
    const id = +member.querySelector('a').href.match(/\d+/)[0]
    if (first) {
      if (lastFirstId === id) break outer
      lastFirstId = id
      first = false
    }
    const pfpUrl = member.querySelector('.profile-picture img').src
    const match = pfpUrl.match(/picture-(.+)\?\d+$/i)
    // if (pfpUrl !== defaultPfp && !match) console.error(pfpUrl)
    students.push({
      // https://pausd.schoology.com/user/{}
      id,
      name: member.querySelector('.user-name').textContent,
      // https://asset-cdn.schoology.com/system/files/imagecache/profile_big/pictures/picture-{}
      pfp: pfpUrl.startsWith(defaultPfp) ? null : match[1]
    })
  }
}
console.log(JSON.stringify(students))
}
