// ==UserScript==
// @name         Make the student ID field not a password field
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  It screws with autofill.
// @author       SheepTester
// @match        https://sdacs.ucsd.edu/~icc/index.php
// @include      https://sdacs.ucsd.edu/~icc/password.php
// @icon         https://www.google.com/s2/favicons?domain=ucsd.edu
// @grant        none
// ==/UserScript==

;(async () => {
  'use strict'

  // Need to replace the element so that autofill doesn't take over
  document.getElementById('account-pid').replaceWith(Object.assign(document.createElement('input'), {
    type: 'text',
    name: 'studentid',
    size: '11',
    maxlength: '12',
    placeholder: 'a12345678',
    className: 'form-control',
    id: 'account-pid',
    required: true
  }))
})()
