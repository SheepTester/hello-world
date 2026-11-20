// ==UserScript==
// @name         old reddit mobile and touch friendly (userscript version)
// @namespace    https://sheeptester.github.io/
// @version      0.1.0
// @description  make buttons fatter
// @author       sheeptester
// @match        https://www.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        none
// @run-at document-start
// ==/UserScript==

(() => {
  'use strict'

  ;(document.head ?? document.documentElement).append(Object.assign(document.createElement('style'), {
    textContent: `
      .expando-button {
          transform: scale(2);
          margin: 30px;
      }
      [data-event-action="comments"],
      .comment .expand,
      .media-gallery .gallery-nav-bar .gallery-navigation {
          padding: 10px !important;
          border: 1px solid red;
          background: #f001;
          display: inline-block;
      }
      [data-event-action="comments"] {
          margin: 0 10px;
      }
      .comment .expand {
          margin-right: 20px;
      }
      .media-gallery .gallery-nav-bar .gallery-navigation {
          margin: 10px;
      }
    `
  }))
})()
