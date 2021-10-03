// ==UserScript==
// @name         achieve pain
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  grr
// @author       You
// @match        https://achieve.macmillanlearning.com/*
// @icon         https://www.google.com/s2/favicons?domain=macmillanlearning.com
// @grant        none
// ==/UserScript==

;(() => {
  'use strict'

  window.onerror = (...args) => console.log('onerror', args)
  console.error = (...args) => console.log('console.error', args)
  window.onunhandledrejection = (...args) => console.log('unhandledrejection', args)

  // their polyfill is bugged
  String.prototype.replaceAll = function (query, replace, ...args) {
    console.log(this, query, replace, ...args)
    return query instanceof RegExp
      ? this.replace(query, replace)
      : this.replace(new RegExp(query.replace(/[[\\^$.|?*+()]/g, '\\$0'), 'g'), replace)
  }
})()

/*

achieve.macmillanlearning.com is a scam. I'm going to have to pay like $70 for their math homework and
they can't even polyfill String.prototype.replaceAll properly.

Their polyfill

    String.prototype.replaceAll||(String.prototype.replaceAll=function(e,t){return"[object regexp]"===
    Object.prototype.toString.call(e).toLowerCase()?(void 0).replace(e,t):(void 0).replace(new RegExp(
    e,"g"),t)})}

does (void 0).replace, which makes no sense. I suspect something converted `this` to `undefined` in
their build process.

Sure, I'm using Chrome 84, and I could just use a more modern browser (by getting a newer computer,
since this Chromebook reached EOL), but I'm paying $70 for this, so they should be supporting browsers
down to IE5.

*/
