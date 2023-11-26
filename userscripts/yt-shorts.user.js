// ==UserScript==
// @name         YT shorts -> watch, old Reddit, desktop Wikipedia
// @namespace    https://sheeptester.github.io/
// @version      1.9
// @description  Redirect YouTube shorts pages to normal video watch pages. Also redirects to old Reddit unless URL ends in ?force-new.
// @author       SheepTester
// @match        https://www.youtube.com/*
// @match        https://www.reddit.com/*
// @match        https://old.reddit.com/*
// @match        https://*.m.wikipedia.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

/* global navigation, URLPattern */

;(async () => {
  'use strict'

  if (window.location.hostname === 'www.reddit.com') {
    // Ignore if `keep-new` is in the query part of the URL
    if (window.location.search.includes('force-new')) {
      return
    }
    // Redirect new Reddit to old Reddit, but only on subreddit pages (not on pages like /poll/)
    if (/^\/([ru]|user)\//.test(window.location.pathname) && !document.documentElement.hasAttribute('xml:lang')) {
      window.location.replace(window.location.href.replace('www', 'old'))
    }
  } else if (window.location.hostname === 'old.reddit.com') {
    // Set default time for controversial and top to all time when signed out
    const page = window.location.href.match(/\/(top|controversial)\/$/)
    if (page) {
      window.location.replace(`?sort=${page[1]}&t=all`)
    }
  } else if (window.location.hostname.endsWith('.wikipedia.org')) {
    // Redirect to desktop Wikipedia
    window.location.replace(window.location.href.replace('.m.', '.'))
  } else {
    // Redirect YouTube shorts to normal video page
    const check = url => {
      const videoId = new URLPattern('https://www.youtube.com/shorts/:video').exec(url)?.pathname.groups.video
      if (videoId) window.location.replace(`/watch?v=${videoId}`)
    }

    check(window.location)
    navigation.addEventListener('navigate', e => check(e.destination.url))
  }
})()
