// ==UserScript==
// @name         sora quick dleete
// @namespace    https://sheeptester.github.io/
// @version      0.1.0
// @description  alt+click to delete
// @author       sheeptester
// @match        https://sora.chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(() => {
  'use strict'

  const deviceId = document.cookie.match(/oai-did=([0-9a-f-]+)/)[1]

  let authorization
  const nativeFetch = window.fetch
  window.fetch = async function myFetch (requestPath, ...args) {
    const response = await nativeFetch(requestPath, ...args)
    if (requestPath === '/api/auth/session') {
      const clone = response.clone()
      clone.json().then(({ accessToken }) => {
        authorization = `Bearer ${accessToken}`
        console.log('authorized', authorization)
      })
    }
    return response
  }

  const notice = document.createElement('div')
  notice.textContent = 'you have quick delete enabled!! alt+click to PERMADELETE'
  Object.assign(notice.style, {
    backgroundColor: '#f007',
    backdropFilter: 'blur(5px)',
    padding: '5px 15px',
    borderRadius: '5px',
    position: 'fixed',
    top: 0,
    right: '50%',
    transform: 'translateX(50%)',
    zIndex: 5000,
    margin: '20px'
  })
  document.body.append(notice)

  const permaDelGen = genId => fetch(`https://sora.chatgpt.com/backend/generations/${genId}`, {
    headers: {
      authorization,
      "oai-device-id": deviceId,
      "oai-language": "en-US"
    },
    method: "DELETE"
  }).then(async r => !r.ok && Promise.reject(new Error(`HTTP ${r.status}: ${await r.text()}`)))

  window.addEventListener('click', async e => {
    if (!e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
      return
    }
    const gen = e.target.closest('[href^="/g/"]')
    if (!gen) {
      return
    }
    e.preventDefault()
    if (!authorization) {
      alert('auth unavailable')
      return
    }
    const genId = new URL(gen.href).pathname.replace('/g/', '')
    gen.style.filter = 'sepia(1)'
    gen.style.pointerEvents = 'none'
    try {
      await permaDelGen(genId)
      gen.style.visibility = 'hidden'
      gen.style.filter = ''
    } catch (error) {
      console.warn(`failed to delete ${genId}`, error)
      gen.style.filter = 'grayscale(1)'
    } finally {
      gen.style.pointerEvents = ''
    }
  })
})()
