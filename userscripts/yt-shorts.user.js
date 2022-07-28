// ==UserScript==
// @name         YT shorts -> watch
// @namespace    https://sheeptester.github.io/
// @version      1.1
// @description  Redirect YouTube shorts pages to normal video watch pages.
// @author       SheepTester
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

/* global navigation, URLPattern */

;(async () => {
  'use strict'

  const check = url => {
    const match = new URLPattern('https://www.youtube.com/shorts/:video').exec(url).pathname.groups.video
    window.location.replace(`/watch?v=${match}`)
  }

  check(window.location)
  navigation.addEventListener('navigate', e => check(e.destination.url))
})()
