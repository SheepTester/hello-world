// ==UserScript==
// @name         Don't try loading the project until the Flash player works
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  For some reason my Chromebook now always says it's out of date
// @author       SheepTester
// @match        https://s2online.github.io/
// @icon         https://www.google.com/s2/favicons?domain=github.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict'

  if (location.hash.length > 1) {
    Object.defineProperty(window, 'JSwillDownload', {
      value: () => false,
      writable: false
    })
    const intervalId = setInterval(() => {
      if (swf.ASopenProjectFromData) {
        clearInterval(intervalId)
        document.body.classList.add('download')
        startDownload(location.hash.slice(1))
      }
    }, 200)
  }
})()
