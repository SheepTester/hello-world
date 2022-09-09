// ==UserScript==
// @name         YT shorts -> watch
// @namespace    https://sheeptester.github.io/
// @version      1.3
// @description  Redirect YouTube shorts pages to normal video watch pages. Also redirects to old Reddit.
// @author       SheepTester
// @match        https://www.youtube.com/*
// @match        https://www.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

/* global navigation, URLPattern */

;(async () => {
  'use strict'

  if (window.location.hostname === 'www.reddit.com' && '__firstCommentLoaded' in window) {
    window.location.replace(window.location.href.replace('www', 'old'))
    return
  }

  const check = url => {
    const videoId = new URLPattern('https://www.youtube.com/shorts/:video').exec(url)?.pathname.groups.video
    if (videoId) window.location.replace(`/watch?v=${videoId}`)
  }

  check(window.location)
  navigation.addEventListener('navigate', e => check(e.destination.url))
})()
