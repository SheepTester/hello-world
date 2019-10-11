// ==UserScript==
// @name         YouTube skip ad
// @namespace    https://sheeptester.github.io
// @version      0.1
// @description  Press alt + s to skip or close ad
// @author       SheepTester
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('keydown', e => {
      if (e.keyCode === 83 && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (document.querySelector('.ad-interrupting')) {
          const video = document.querySelector('video');
          video.currentTime = video.getDuration();
        }
        Array.from(document.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-skip-button'), btn => btn.click());
      }
    });
})();
