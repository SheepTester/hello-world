// ==UserScript==
// @name         Piskel less laggy pen/touch
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  I think using pen/touch is laggy on Piskel because they don't properly preventDefault touch events
// @author       You
// @match        https://www.piskelapp.com/p/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict'

  window.addEventListener('touchstart', e => e.preventDefault(), { passive: false })
  window.addEventListener('touchmove', e => e.preventDefault(), { passive: false })
  window.addEventListener('touchend', e => e.preventDefault(), { passive: false })
})()
