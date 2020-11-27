// ==UserScript==
// @name         Schoology liker and disliker
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  Like and dislike most updates and comments on Schoology!
// @author       You
// @match        *://*.schoology.com/*
// @exclude      *://asset-cdn.schoology.com/*
// @exclude      *://*.schoology.com/attachment/*
// @grant        none
// ==/UserScript==

/* global Drupal, siteNavigationUiProps */

(async () => {
  'use strict'

  const domain = window.location.hostname.replace('.schoology.com', '')
  const DISLIKE_HOST = `http://localhost:3000/sgy/dislike/${domain}/`
  const myUserId = `${domain}-${siteNavigationUiProps.props.user.uid}`

  const removeDomainRegex = /\w+-/
  function removeDomain (id) {
    return id.replace(removeDomainRegex, '')
  }

  async function openPopup (ready) {
    const loadingText = document.createElement('div')
    loadingText.textContent = 'Loading...'

    const loading = document.createElement('div')
    loading.id = 'popups-loading'
    loading.style.display = 'block'
    loading.append(loadingText)

    const overlay = document.createElement('div')
    overlay.id = 'popups-overlay'
    Object.assign(overlay.style, {
      background: 'rgba(255, 255, 255, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      position: 'fixed'
    })
    overlay.append(loading)

    document.body.append(overlay)

    const { title: titleText, fragment } = await ready

    const closeBtnA = document.createElement('a')
    closeBtnA.href = '#'
    closeBtnA.addEventListener('click', e => {
      overlay.remove()
      e.preventDefault()
    })

    const closeBtn = document.createElement('div')
    closeBtn.className = 'popups-close'
    closeBtn.append(closeBtnA)

    const title = document.createElement('div')
    title.className = 'popups-title'
    title.append(titleText, closeBtn)

    const itemList = document.createElement('ul')
    itemList.className = 'item-list'
    itemList.append(fragment)

    const cancelBtn = document.createElement('a')
    Object.assign(cancelBtn, {
      href: '#',
      textContent: 'Close',
      className: 'cancel-btn'
    })
    cancelBtn.addEventListener('click', e => {
      overlay.remove()
      e.preventDefault()
    })

    const submitBtns = document.createElement('div')
    submitBtns.className = 'submit-buttons'
    submitBtns.append(cancelBtn)

    const body = document.createElement('div')
    Object.assign(body, {
      className: 'popups-body',
      tabIndex: 0
    })
    body.append(itemList, submitBtns)

    const popup = document.createElement('div')
    popup.style.position = 'relative'
    Object.assign(popup, {
      className: 'popups-box popups-medium likers',
      role: 'dialog'
    })
    popup.append(title, body)

    overlay.append(popup)
    loading.remove()
    closeBtnA.focus()
  }

  function getUsers (userIds) {
    return fetch('/v1/multiget', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Csrf-Token': Drupal.settings.s_common.csrf_token,
        'X-Csrf-Key': Drupal.settings.s_common.csrf_key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request: userIds.map(userId => `/v1/users/${removeDomain(userId)}`)
      })
    })
      .then(responseOk)
      .then(r => r.json())
      .then(({ response }) => response.map(r => r.body))
  }

  function makeLikeBtn (likeUrl) {
    const likeBtn = document.createElement('span')
    Object.assign(likeBtn, {
      tabIndex: 0,
      role: 'button',
      className: 'like-btn clickable FOREIGN',
      textContent: 'Toggle like'
    })
    likeBtn.addEventListener('click', () => {
      Object.assign(likeBtn.style, {
        color: null,
        opacity: 0.7,
        pointerEvents: 'none'
      })
      likeBtn.textContent = 'Toggling'
      fetch(likeUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Csrf-Token': Drupal.settings.s_common.csrf_token,
          'X-Csrf-Key': Drupal.settings.s_common.csrf_key,
        }
      }).then(response => {
        if (response.ok) {
          Object.assign(likeBtn.style, {
            color: 'green',
            opacity: null,
            pointerEvents: null
          })
          likeBtn.textContent = 'Toggle like again ✔️'
        } else if (response.status === 429) {
          Object.assign(likeBtn.style, {
            color: 'coral',
            opacity: null,
            pointerEvents: null
          })
          likeBtn.textContent = 'You\'re toggling too quickly; wait then try again. ⏱'
        } else {
          throw response.status
        }
      }).catch(err => {
        console.error('SAD TOGGLE ERROR', err)
        Object.assign(likeBtn.style, {
          color: 'red',
          opacity: null,
          pointerEvents: null
        })
        likeBtn.textContent = 'Toggle failed (check console?) ❌️'
      })
    })
  }
  function updateDislikeBtn (dislikeBtn, dislikes, disliking) {
    dislikeBtn.dataset.disliking = disliking
    dislikeBtn.dataset.count = dislikes
    dislikeBtn.textContent = disliking ? 'Undislike' : 'Dislike'

    const dislikeCount = dislikeBtn.parentNode.querySelector('.dislike-count')
    dislikeCount.textContent = dislikes ? `👎 ${dislikes}` : ''
  }
  function updateUpdatesAndComments () {
    const dislikes = {}
    const updates = document.querySelectorAll('.s-edge-type-update-post')
    const comments = document.querySelectorAll('.comment[id^="comment-"]')
    for (const comment of comments) {
      const nid = comment.id.replace('comment-', '')
      const footer = comment.querySelector('.comment-footer')
      if (!footer.querySelector('.like-btn')) {
        const likeCount = footer.querySelector('.s-like-comment')
        const likeBtn = makeLikeBtn(`/like/c/${nid}`)
        if (likeCount) {
          likeCount.before(' · ', likeBtn)
        } else {
          footer.append(' · ', likeBtn)
        }
      }
      const dnid = 'c' + nid // dnid = "dislike NID"
      let dislikeBtn = footer.querySelector('.dislike-btn')
      if (!dislikeBtn) {
        dislikeBtn = document.createElement('span')
        Object.assign(dislikeBtn, {
          tabIndex: 0,
          role: 'button',
          className: 'dislike-btn clickable FOREIGN',
          textContent: 'Dislike'
        })
        dislikeBtn.style.fontWeight = 'normal'
        dislikeBtn.dataset.nid = dnid

        const dislikeCountWrapper = document.createElement('span')
        Object.assign(dislikeCountWrapper, {
          tabIndex: 0,
          className: 's-like-comment dislike-count-wrapper FOREIGN'
        })
        dislikeCountWrapper.dataset.nid = dnid
        const dislikeCount = document.createElement('a')
        dislikeCount.className = 'dislike-count FOREIGN'
        dislikeCount.style.cssText = 'background: none !important; padding: 0 !important;'
        dislikeCountWrapper.append(dislikeCount)

        footer.append(' · ', dislikeBtn, dislikeCountWrapper)
      }
      dislikes[dnid] = dislikeBtn
    }
    return dislikes
  }
  document.addEventListener('keydown', async e => {
    if (e.key === 'd') {
      const dislikeBtns = updateUpdatesAndComments()
      const nids = Object.keys(dislikeBtns)
      const dislikes = await getDislikes(nids)
      console.log({ dislikeBtns, dislikes })
      for (const nid of nids) {
        const dislikeBtn = dislikeBtns[nid]
        const dislikers = dislikes[nid] || []
        updateDislikeBtn(dislikeBtn, dislikers.length, dislikers.includes(myUserId))
      }
    }
  })
  document.addEventListener('click', e => {
    const dislikeBtn = e.target.closest('.dislike-btn')
    if (dislikeBtn) {
      const { nid, disliking } = dislikeBtn.dataset
      Object.assign(dislikeBtn.style, {
        color: null,
        opacity: 0.7,
        pointerEvents: 'none'
      })
      dislike(nid, disliking !== 'true').then(({ disliking }) => {
        Object.assign(dislikeBtn.style, {
          opacity: null,
          pointerEvents: null
        })
        const change = disliking ? 1 : -1
        updateDislikeBtn(dislikeBtn, +dislikeBtn.dataset.count + change, disliking)
      }).catch(err => {
        console.error(err)
        Object.assign(dislikeBtn.style, {
          color: 'red',
          opacity: null,
          pointerEvents: null
        })
        dislikeBtn.textContent += ' ❌️'
      })
      return
    }
    const dislikeCountBtn = e.target.closest('.dislike-count-wrapper')
    if (dislikeCountBtn) {
      const nid = dislikeCountBtn.dataset.nid
      const promise = getDislikes([nid])
        .then(async ({ [nid]: dislikers }) => {
          const fragment = document.createDocumentFragment()
          if (dislikers.length) {
            for (const user of await getUsers(dislikers.slice(0, 50))) {
              if (!user) {
                fragment.append(Object.assign(document.createElement('li'), {
                  textContent: '???'
                }))
              }

              const { id, name_display, picture_url } = user
              const image = Object.assign(document.createElement('img'), {
                src: picture_url,
                className: 'profile-picture-wrapper'
              })
              image.style.height = '46px'

              const imageLink = Object.assign(document.createElement('a'), {
                href: `/user/${id}`
              })
              imageLink.append(image)

              const imageWrapper = Object.assign(document.createElement('div'), {
                className: 'picture'
              })
              imageWrapper.append(imageLink)

              const li = document.createElement('li')
              li.append(
                imageWrapper,
                Object.assign(document.createElement('a'), {
                  href: `/user/${id}`,
                  className: 'vertical-center',
                  textContent: name_display
                })
              )
              fragment.append(li)
            }
            for (const extra of dislikers.slice(50)) {
              fragment.append(Object.assign(document.createElement('li'), {
                textContent: extra
              }))
            }
          }
          return {
            title: `Dislikers (${dislikers.length})`,
            fragment
          }
        })
      openPopup(promise)
      return
    }
  })

  const PORTFOLIO_IDS = '[sheeptester] dislike.portfolio'
  const { User, ItemType, responseOk } = await import('https://sheeptester.github.io/javascripts/sgy-portfolios.js')
  async function getMyPortfolio () {
    const me = new User()
    const ids = localStorage.getItem(PORTFOLIO_IDS)
    if (ids) {
      const [portfolioId, itemId] = ids.split(' ')
      try {
        const portfolio = me.portfolio(portfolioId)
        const item = portfolio.item(itemId)
        await Promise.all([portfolio.get(), item.get()])
        return item
      } catch {}
    }
    const portfolios = await me.portfolios()
    let portfolio = portfolios.find(portfolio => portfolio.data.title.includes('!WELLNESS'))
    if (portfolio) {
      await portfolio.get()
    } else {
      portfolio = await me.createPortfolio({
        title: '!WELLNESS WEDNESDAY What I LOVE',
        description: 'To make sure the Wellness Center staff can find what you are grateful for!'
      })
      await portfolio.publish()
    }
    let item = portfolio.items().find(item => item.data.item_type === ItemType.PAGE)
    if (!item) {
      item = await portfolio.createItem(ItemType.PAGE, {
        title: 'My Gratefulness List',
        description: 'Things I am grateful for!',
        // Seems necessary
        metadata: {
          content: '<h1>Things I am grateful for:</h1>'
        }
      })
    }
    localStorage.setItem(PORTFOLIO_IDS, `${portfolio.id} ${item.id}`)
    return item
  }

  const dislikeRecord = await getMyPortfolio()
  console.log(dislikeRecord)
  async function dislike (nid, add) {
    const message = `[love${nid}]`
    await dislikeRecord.update({
      metadata: {
        content: add
          ? dislikeRecord.data.metadata.content + '<p>Many great things happened today!</p>' + message
          : dislikeRecord.data.metadata.content.replaceAll(message, '')
      }
    })
    return fetch(DISLIKE_HOST + nid, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: dislikeRecord.portfolio.user.id + '',
        portfolioId: dislikeRecord.portfolio.id,
        pageId: dislikeRecord.id,
        publicHash: dislikeRecord.portfolio.data.public_hash
      })
    })
      .then(responseOk)
      .then(r => r.json())
  }

  function getDislikes (nids) {
    return fetch(DISLIKE_HOST + '?nids=' + nids.join('-'))
      .then(responseOk)
      .then(r => r.json())
  }
})()
