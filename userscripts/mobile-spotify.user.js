// ==UserScript==
// @name         Spotify mobile thingy
// @namespace    https://sheeptester.github.io/
// @version      0.1.0
// @description  get spotify desktop to work on firefox mobile
// @author       Sean
// @match        *://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    Object.defineProperty(window, 'devicePixelRatio', {
        get () {
            //console.log(new Error('dpr'))
            return 1
        }
    })
    Object.defineProperty(navigator, 'userAgent', {
        get () {
            //console.log(new Error('ua'))
            return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        }
    })
})();
