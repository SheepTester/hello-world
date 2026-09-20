// ==UserScript==
// @name         chatgpt nav
// @namespace    https://sheeptester.github.io/
// @version      0.2.1
// @description  DESCRIPTION
// @author       sheeptester
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict'

  window.addEventListener('keydown', async e => {
    const desc = [
      e.ctrlKey || e.metaKey ? 'ctrl' : '',
      e.shiftKey ? 'shift' : '',
      e.altKey ? 'alt' : '',
    ].filter(x => x).join('+')
    if (desc === 'alt') {
      if (e.key === 'ArrowLeft') {
        const item = document.querySelector('.__menu-item[data-active]').parentElement.previousElementSibling.firstElementChild
        item.click()
        item.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      }
      if (e.key === 'ArrowRight') {
        const item = document.querySelector('.__menu-item[data-active]').parentElement.nextElementSibling.firstElementChild
        item.click()
        item.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      }
      if (e.key === 'c') {
        const copyBtn = [...document.querySelectorAll('[data-turn="user"] [data-testid="copy-turn-action-button"]')].at(-1)
        copyBtn.click()
        copyBtn.parentElement.style.opacity = 1
        e.preventDefault()
      }
      if (e.key === 'd') {
        e.preventDefault()
        document.querySelector('[data-testid="history-item-0-options"]').click()
        await new Promise(window.requestAnimationFrame)
        document.querySelector('[data-testid="delete-chat-menu-item"]').click()
        await new Promise(window.requestAnimationFrame)
        document.querySelector('[data-testid="delete-conversation-confirm-button"]').click()
      }
    }
  })

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(String.raw`.group\/imagegen-image::before {
  position: absolute;
  top: 0;
  left: 0;
  content: counter(wow);
  z-index: 5;
}
.group\/imagegen-image {
  counter-increment: wow;
}`)
  document.adoptedStyleSheets.push(sheet)
})()
