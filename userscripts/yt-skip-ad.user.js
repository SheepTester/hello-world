// ==UserScript==
// @name         YouTube skip ad
// @namespace    https://sheeptester.github.io
// @version      0.5
// @description  Press alt + s to skip or close ad; logs ad video URL in console.
// @author       SheepTester
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function getAdID() {
    return ytcsi?.reference?.video_to_ad?.info?.adVideoId ??
      ytcsi?.data_?.info?.docid ??
      ytcsi?.data_?.gel?.gelInfos?.videoId;
  }

  document.addEventListener('keydown', e => {
    if (e.keyCode === 83 && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      if (document.querySelector('.ad-interrupting')) {
        console.log(`%cAd video URL: https://www.youtube.com/watch?v=${getAdID()}`, 'font-size: 16px;');
        const video = document.querySelector('video');
        const duration = video.getDuration?.() ?? video.duration;
        if (!Number.isNaN(duration)) {
          video.currentTime = duration;
        }
      }
      Array.from(document.querySelectorAll('.ytp-ad-overlay-close-button, .ytp-ad-skip-button, .ytp-ad-survey-interstitial-action-button'), btn => btn.click());
    }
  });
})();
