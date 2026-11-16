// ==UserScript==
// @name         chatgpt nav
// @namespace    https://sheeptester.github.io/
// @version      0.2.2
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
        const item = document.querySelector('[data-sidebar-cycle-item][aria-current="page"]')?.closest('[data-sidebar-chatgpt-conversation-key]')?.previousElementSibling?.querySelector('[data-interactive-row-link]')
        if (!item) {
          console.log('%c[warn]', 'font-weight: bold; color: lightblue', 'couldn\'t find prev item')
          e.preventDefault()
          return
        }
        item.click()
        item.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      }
      if (e.key === 'ArrowRight') {
        const item = document.querySelector('[data-sidebar-cycle-item][aria-current="page"]')?.closest('[data-sidebar-chatgpt-conversation-key]')?.nextElementSibling?.querySelector('[data-interactive-row-link]')
        if (!item) {
          console.log('%c[warn]', 'font-weight: bold; color: lightblue', 'couldn\'t find next item')
          e.preventDefault()
          return
        }
        item.click()
        item.scrollIntoView({ block: 'nearest' })
        e.preventDefault()
      }
      if (e.key === 'c') {
        const copyBtn = [...document.querySelectorAll('.group\\/user-message [aria-label="Copy message"]')].at(-1)
        copyBtn.click()
        copyBtn.closest('.opacity-0')?.classList.remove('opacity-0')
        e.preventDefault()
      }
      if (e.key === 'd') {
        e.preventDefault()
        document.querySelector('[aria-label="Chat actions"]').dispatchEvent(new KeyboardEvent("keydown", { key: ' ', bubbles: true }))
        await new Promise(window.requestAnimationFrame)
        document.querySelector('body > .contents [role="menuitem"].text-danger').click()
        // await new Promise(window.requestAnimationFrame)
        document.querySelector('body > .contents [type=submit]').click()
      }
    }
  })

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(String.raw`[data-masonry-item]::before {
  position: absolute;
  top: 0;
  left: 0;
  content: counter(wow);
  z-index: 5;
}
[data-masonry-item] {
  counter-increment: wow;
  /* outline: 1px solid red; */
}`)
  document.adoptedStyleSheets.push(sheet)
})()
