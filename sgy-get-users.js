// In collaboration with https://github.com/SheepTester/sgy-sgy/blob/bfba3c1d6bc2d438b2aa48f8d96649777da51e8e/explorer/app.js#L59-L74

data = JSON.stringify(Array.from(document.querySelectorAll('a'), a => [a.textContent, a.href]))

async function docFromUrl (url) {
  const doc = new DOMParser()
    .parseFromString(await fetch(url).then(r => r.text()), 'text/html')
  return doc
}
async function discussion (url) {
  const doc = await docFromUrl(url)
  const users = []
  for (const user of doc.querySelectorAll('.discussion-user-filter')) {
    const id = user.id.replace('discussion-user-filter', '')
    const name = user.querySelector('.user-stats-name').textContent
    const pfp = user.querySelector('img').src
    users.push({ id, name, pfp })
  }
  return users
}
async function album (url) {
  const doc = await docFromUrl(url)
  const userName = siteNavigationUiProps.props.user.name
  const myPhoto = doc.querySelector(`.thumbnail-pic[title*="${userName}"]`)
  if (!myPhoto) return null
  const myPhotoLink = myPhoto.parentNode.getAttribute('malink')
  const photoPage = await fetch(new URL(myPhotoLink, url))
    .then(r => r.text())
  const match = photoPage.match(/jQuery\.extend\(Drupal\.settings, ({.+})\);/)
  const { s_media_album_userlist: users } = JSON.parse(match[1])
  return users.map(({ n, p, u }) => ({
    id: u,
    name: n,
    pfp: p
  }))
}
output = {}
for (const [name, url] of data) {
  if (name.includes('(album)')) {
    output[name] = await album(url)
  } else {
    output[name] = await discussion(url)
  }
}
output

function user ({ id, name, pfp }) {
  return `<p><a href="https://pausd.schoology.com/user/${id}/info"><img src="${pfp}">${name}</a></p>`
}
for (const [heading, users] of Object.entries(output)) {
  if (users) {
    console.log(heading)
    console.log('data:text/html;charset=UTF-8,' + encodeURIComponent(users.map(user).join('')))
  }
}
