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

(async () => {
  'use strict'

  const PORTFOLIO_IDS = '[sheeptester] dislike.portfolio'
  const { User, ItemType, responseOk } = await import('http://localhost:8080/javascripts/sgy-portfolios.js')
  async function getMyPortfolio () {
    const me = new User()
    const ids = localStorage.getItem(PORTFOLIO_IDS)
    if (ids) {
      const [portfolioId, itemId] = ids.split(' ')
      try {
        return await me.portfolio(portfolioId).item(itemId).get()
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

  const domain = window.location.hostname.replace('.schoology.com', '')
  const DISLIKE_HOST = `http://localhost:3000/sgy/dislike/${domain}/`

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
    await fetch(DISLIKE_HOST + nid, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: dislikeRecord.portfolio.user.id,
        portfolioId: dislikeRecord.portfolio.id,
        pageId: dislikeRecord.id,
        publicHash: dislikeRecord.portfolio.data.public_hash
      })
    }).then(responseOk)
  }

  function getDislikes (nids) {
    return fetch(DISLIKE_HOST + '?nids=' + nids.join('-'))
      .then(responseOk)
      .then(r => r.json())
  }
})()
