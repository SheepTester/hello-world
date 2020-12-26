const get = url => fetch(url, {
  credentials: 'include',
  headers: {
    'X-IG-App-ID': '936619743392459',
    'X-IG-WWW-Claim': sessionStorage['www-claim-v2']
  }
}).then(r => r.json())
const { tray } = await get('https://i.instagram.com/api/v1/feed/reels_tray/')
const { reels_media } = await get('https://i.instagram.com/api/v1/feed/reels_media/?' + tray.map(story => 'reel_ids=' + story.id).join('&'))
const stories = reels_media.map(({
  user: { username },
  items
}) => ({
  username,
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
document.body.innerHTML = stories.map(({ username, stories }) =>
  `<h3>${username}</h3><ul>${stories.map(({ time, image, video }) =>
    `<li><p>${time.toString()}</p>${
      video ? `<video src="${video}" controls></video>` : `<img src="${image}" />`
    }</li>`
  ).join('')}</ul><style>img, video { max-width: 100vw; max-height: 100vh; } body { background: black; color: white; }</style>`
).join('')
console.log(stories)

// metadata for bookmarklet.html
// `@name Incognito story viewer`
// `@link https://www.instagram.com/`
// `@linklabel Instagram`
