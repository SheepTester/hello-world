// ==UserScript==
// @name         Request all courses as alternates
// @namespace    https://sheeptester.github.io/
// @version      1.1
// @description  Buttons are available on the course registration page (https://pausdca.infinitecampus.org/campus/nav-wrapper/student/portal/student/general-info/course-registration)
// @author       SheepTester
// @match        *://*.infinitecampus.org/campus/apps/portal/student/*
// @grant        none
// ==/UserScript==

// "SO - if there's a chance you might want to take a class but aren't
// sure - put it as an ALTERNATE. You have nothing to lose by doing so
// and we won't consider the class in August if it is not listed on
// your alternates. Do two alternates minimum!"
//   - Gunn Counseling

(async () => {
  'use strict';

  async function all (add = 'A') {
    const [{ personID }] = await fetch('/campus/resources/portal/students')
      .then(r => r.json())
    const calendarID = +/\d+/.exec(window.location.pathname)[0]
    const courses = await fetch(`/campus/resources/prism/portal/searchRequests?personID=${personID}&calendarID=${calendarID}`)
      .then(r => r.json())
    await Promise.all(courses.map(({ courseID }) =>
      fetch('/campus/resources/prism/portal/' + (add ? 'addStudentRequest' : 'deleteStudentRequest'), {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personID,
          calendarID,
          courseID,
          type: add || ''
        })
      })))
    return { personID, calendarID, courses }
  }

  function wait (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function nextFrame () {
    return new Promise(resolve => window.requestAnimationFrame(resolve))
  }

  function injectionTarget () {
    return document.querySelector('app-registration-summary .button-group:not(.touched)')
  }

  // I don't think I should bother with leaving the loop if it never finds the target.
  while (true) {
    const target = injectionTarget()
    if (target) {
      target.classList.add('touched')

      const toAlts = document.createElement('button')
      toAlts.className = 'button'
      toAlts.textContent = 'Request All Courses As Alternates'
      toAlts.addEventListener('click', e => {
        toAlts.classList.add('disabled')
        noAlts.classList.add('disabled')
        all('A')
          .then(() => {
            toAlts.classList.remove('disabled')
            noAlts.classList.remove('disabled')
          })
      })
      target.appendChild(toAlts)

      const noAlts = document.createElement('button')
      noAlts.className = 'button button--danger'
      noAlts.textContent = 'Delete All Requests/Alternates'
      noAlts.addEventListener('click', e => {
        noAlts.classList.add('disabled')
        toAlts.classList.add('disabled')
        all(false)
          .then(() => {
            noAlts.classList.remove('disabled')
            toAlts.classList.remove('disabled')
          })
      })
      target.appendChild(noAlts)
    }
    await nextFrame()
  }
})()
