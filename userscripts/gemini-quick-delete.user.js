// ==UserScript==
// @name         gemini delete chat
// @namespace    https://sheeptester.github.io/
// @version      0.1.0
// @description  press alt+click on a chat to quick delete it
// @author       You
// @match        https://gemini.google.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(() => {
    'use strict'

    if (!window.__deleteChatted) {
        window.__deleteChatted = true
        document.body.addEventListener('mousedown', async e => {
            if (!e.altKey) {
                return
            }
            const convo = e.target.closest('.conversation-items-container')
            convo.style.outline = '1px solid red'
            convo.style.pointerEvents = 'none'
            convo.style.position = 'fixed'
            convo.style.top = '0'
            e.preventDefault()

            convo.querySelector('[data-test-id="actions-menu-button"]').click()
            document.querySelector('[data-test-id="delete-button"]').click()
            await new Promise(resolve => window.requestAnimationFrame(resolve))
            document.querySelector('[data-test-id="confirm-button"]').click()
        }, { passive: false })
    }

    const warning = document.createElement('p')
    warning.textContent = 'You have GEMINI CONVENIENT DELETE enabled. Alt+click a convo to delete.'
    Object.assign(warning.style, {
        background: '#ff07',
        color: 'black',
        fontWeight: 'bold',
        padding: '10px',
        margin: '20px',
        position: 'fixed',
        top: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 3000,
        borderRadius: '50px',
        backdropFilter: 'blur(2px)',
        fontFamily: 'sans-serif'
    })
    document.body.append(warning)
})()
