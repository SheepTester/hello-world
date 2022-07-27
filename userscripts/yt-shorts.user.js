// ==UserScript==
// @name         YT shorts -> watch
// @namespace    https://sheeptester.github.io/
// @version      1.0
// @description  Redirect YouTube shorts pages to normal video watch pages.
// @author       SheepTester
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

/* global navigation, URLPattern */

;(async () => {
  'use strict'

  navigation.addEventListener('navigate', e => {
    const match = new URLPattern('https://www.youtube.com/shorts/:video').exec(e.destination.url).pathname.groups.video
    window.location.replace(`/watch?v=${match}`)
  })
})()
