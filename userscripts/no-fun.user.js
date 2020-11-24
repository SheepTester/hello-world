// ==UserScript==
// @name         🥱 NO FUN ALLOWED
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  no fun.
// @author       sheeptester
// @match        *://discord.com/*
// @include      *://*.reddit.com/*
// @include      *://www.youtube.com/*
// @include      *://www.instagram.com/*
// @include      *://twitter.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  document.write('no fun allowed');
  document.body.style.color = 'red';
  document.body.style.fontSize = '50px';
  setTimeout(() => {
    alert('no fun allowed');
  });
  setTimeout(() => {
    while (true);
  }, 1000);
  window.stop();
})();
