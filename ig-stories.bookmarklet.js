const get = url => fetch(url, {
  credentials: 'include',
  headers: {
    'X-IG-App-ID': '936619743392459',
    'X-IG-WWW-Claim': sessionStorage['www-claim-v2']
  }
}).then(r => r.json())
const { tray } = await get('https://i.instagram.com/api/v1/feed/reels_tray/')
const reelsMedia = []
for (let i = 0; i < tray.length; i += 30) {
  const { reels_media } = await get('https://i.instagram.com/api/v1/feed/reels_media/?' + tray.slice(i, i + 30).map(story => 'reel_ids=' + story.id).join('&'))
  reelsMedia.push(...reels_media)
}
const stories = reelsMedia.map(({
  user: { pk, username, full_name, profile_pic_url },
  items
}) => ({
  id: pk,
  username,
  name: full_name,
  pfp: profile_pic_url,
  stories: items.map(({
    image_versions2: { candidates: [{ url: image }] },
    video_versions: [{ url: video } = {}] = [],
    taken_at
  }) => ({
    time: new Date(taken_at * 1000),
    image,
    video
  }))
}))
document.body.innerHTML = stories.map(({ id, username, name, pfp, stories }) =>
  `<h3 onmouseenter="enter(this)" data-id="${id}"><img class="pfp" src="${pfp}" height=48>@${username} <em>${name}</em></h3><ul>${stories.map(({ time, image, video }) =>
    `<li><p>${time.toString()}</p>${
      video ? `<video src="${video}" controls></video>` : `<img src="${image}" />`
    }</li>`
  ).join('')}</ul>`
).join('') + '<style>img, video { max-width: 90vw; max-height: 600px; } body { background: black; color: white; overflow: auto !important; } ul { overflow: auto; white-space: nowrap; } li { display: inline-block; } .pfp { border: 1px solid grey; }</style>'
window.enter = async elem => {
elem.onmouseenter = null
const { user: { biography, hd_profile_pic_url_info: { url: pfp } } } = await get(`https://i.instagram.com/api/v1/users/${elem.dataset.id}/info/`)
elem.after(biography)
}
console.log(stories)

// metadata for bookmarklet.html
// `@name Incognito story viewer`
// `@link https://www.instagram.com/`
// `@linklabel Instagram`
// `@inline eval`
