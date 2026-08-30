// ==UserScript==
// @name         chatgpt nav
// @namespace    https://sheeptester.github.io/
// @version      0.1.0
// @description  DESCRIPTION
// @author       sheeptester
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict'

  window.addEventListener('keydown', e => {
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
        const copyBtn = document.querySelector('[data-testid="conversation-turn-1"] [data-testid="copy-turn-action-button"]')
        copyBtn.click()
        copyBtn.parentElement.style.opacity = 1
        e.preventDefault()
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
