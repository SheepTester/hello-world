// javascript:void(document.head.appendChild(document.createElement('script')).src = 'https://sheeptester.github.io/hello-world/i-love-schoology.js')

// Code that shows a like button and a comment link for liking on updates where liking is disabled.
// You can paste this in the console or use this as a bookmarklet.

(function main () {
const btns = []
if (window.removeBidens) window.removeBidens()

function button () {
const btn = document.createElement('a')
btns.push(btn)
return btn
}

function likeBtn (likeUrl) {
const btn = button()
btn.style.color = 'green'
btn.href = likeUrl
btn.textContent = 'Toggle like/unlike'
btn.onclick = e => {
btn.style.color = 'lawngreen'
fetch(likeUrl, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-Csrf-Token' : Drupal.settings.s_common.csrf_token,
    'X-Csrf-Key'   : Drupal.settings.s_common.csrf_key,
  }
}).then(response => {
  if (response.ok) {
    btn.textContent = 'Success! Click to undo.'
  } else {
    if (response.status === 429) {
      btn.textContent = 'Schoology\'s pissed and jealous at your speed. Calm down for a moment, then click to try toggling like/unlike again.'
    } else {
      throw 'a fit'
    }
  }
  btn.style.color = 'green'
}).catch(() => {
  btn.textContent = 'Something weird happened and you couldn\'t like/unlike. Maybe check the inspect element console for errors?'
  btn.style.color = 'red'
})
e.preventDefault()
}
return btn
}

function commentBtn (commentUrl) {
const btn = button()
btn.style.color = 'firebrick'
btn.href = commentUrl
btn.textContent = 'Add comments (Use inspect element to remove the disabled attribute from the post button if there is one)'
btn.target = '_blank'
return btn
}

for (const { parentNode, id } of document.querySelectorAll('[id^="comment-"]')) {
parentNode.querySelector('.comment-time')
  .append(' ', likeBtn('/like/c/' + id.replace('comment-', '')))
}

const updates = new Map()
for (const elem of document.querySelectorAll('[href^="/update_post/"]')) {
updates.set(elem.closest('.edge-main-wrapper'), elem.href.split('/')[4])
}
for (const elem of document.querySelectorAll('[href^="/likes/n/"]')) {
updates.set(elem.closest('.edge-main-wrapper'), elem.getAttribute('href').replace('/likes/n/', ''))
}
for (const [wrapper, id] of updates) {
wrapper.querySelector('.created').append(' ', likeBtn(`/like/n/${id}/`), ' ', commentBtn(`/update_post/${id}/comments`))
}

window.removeBidens = () => {
for (const btn of btns) btn.remove()
window.removeBidens = null
}
})()

// metadata for bookmarklet.html
// `@name Like posts even when you can't on Schoology`
// `@link https://pausd.schoology.com/user/2017219/updates`
// `@linklabel anywhere on Schoology`
