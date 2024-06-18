// ==UserScript==
// @name         Automatic TA evaluation (SETs)
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  Automatically give all TAs in the course "strongly agree" for everything.
// @author       SheepTester
// @match        https://academicaffairs.ucsd.edu/Modules/Evals/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ucsd.edu
// @grant        none
// ==/UserScript==

;(async () => {
  'use strict'

  if (window.location.pathname.endsWith('/Default.aspx')) {
      document.body.insertAdjacentHTML('afterbegin', '<p style="position: fixed; top: 50px; left: 0; color: red; font-weight: bold; z-index: 1000; background-color: #fffa; padding: 10px;">I will automatically rate your TAs 10/10. Click EVALUATE on a TA to begin. Turn the script off if you don\'t want me.</p>')
    return
  }
  const beginBtn = document.querySelector('[name$="$btnBeginEvaluation"]')
  if (beginBtn) {
    beginBtn.click()
    return
  }
  const nextEval = document.querySelector('.card-body:not(:has(.fa-check-circle)) ~ .card-footer a[title="Click to evaluate this person"]')
  if (nextEval) {
    nextEval.click()
    return
  }
  if (document.querySelector('[value="58"]')) {
    // For some reason, all of the "Strongly agree" options have a value of 58
    let anyWasUnchecked = false
    for (const radio of document.querySelectorAll('[value="58"]')) {
      if (!radio.checked) {
        anyWasUnchecked = true
      }
      radio.click()
    }
    if (!anyWasUnchecked) {
      window.location = 'Default.aspx'
      return
    }
    // "No issues" (not present for grad classes)
    document.querySelector('[value="82"]')?.click()
    // Submit
    document.querySelector('[value="Submit Evaluation"]').click()
  }
  const completeBtn = document.querySelector('[name$="btnCompleteEvaluation"]')
  if (completeBtn) {
    completeBtn.click()
    return
  }
  const returnHome = document.querySelector('.alert [href="Default.aspx"]')
  if (returnHome) {
    returnHome.click()
    return
  }
})()
