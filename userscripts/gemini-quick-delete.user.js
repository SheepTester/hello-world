// ==UserScript==
// @name         gemini delete chat
// @namespace    https://sheeptester.github.io/
// @version      0.2.0
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

        const status = document.createElement('p')
        status.textContent = 'GEMINI userscript enabled. press ALT + D to enable quick delete, + → for next convo, + C for copy'
        Object.assign(status.style, {
            background: '#fff7',
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
        document.body.append(status)

        let quickDeleteEnabled = false
        document.body.addEventListener('mousedown', async e => {
            if (!e.altKey || !quickDeleteEnabled) {
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

        window.addEventListener('keydown', e => {
            if (e.shiftKey || e.metaKey || e.ctrlKey || !e.altKey) {
                return
            }
            switch (e.key) {
                case 'd': {
                    quickDeleteEnabled = !quickDeleteEnabled;
                    status.textContent = quickDeleteEnabled ? 'QUICK DELETE ENABLED. alt + click to delete.' : 'calm.'
                    status.style.backgroundColor = quickDeleteEnabled ? '#ff07' : '#fff7'
                    break
                }
                case 'ArrowRight': {
                    const nextConvo = document.querySelector('.conversation.selected')?.parentElement.nextElementSibling?.firstElementChild
                    nextConvo?.click()
                    nextConvo?.scrollIntoView({ block: 'nearest' })
                    break
                }
                case 'ArrowLeft': {
                    const prevConvo = document.querySelector('.conversation.selected')?.parentElement.previousElementSibling?.firstElementChild
                    prevConvo?.click()
                    prevConvo?.scrollIntoView({ block: 'nearest' })
                    break
                }
                case 'c': {
                    document.querySelector('[aria-label="Copy prompt"]').click()
                    break
                }
                default: {
                    return
                }
            }
            e.preventDefault()
        })

        document.styleSheets[0].insertRule(`
        .conversation-container:last-child:not(:first-child)::before {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            bottom: 50px;
            color: black;
            font-weight: bold;
            font-family: sans-serif;
            background-color: yellow;
            padding: 5px 10px;
            border-radius: 50px;
            content: "There's more above!";
            z-index: 100;
        }
        `)
        document.styleSheets[0].insertRule(`
        .library-item-grid {
            counter-reset: bleh;
        }
        `)
        document.styleSheets[0].insertRule(`
        library-item-card::before {
            content: counter(bleh);
            position: absolute;
            z-index: 1;
            counter-increment: bleh;
            font-weight: bold;
            font-family: sans-serif;
            background-color: #0007;
            padding: 5px;
            border-bottom-right-radius: 5px;
        }
        `)
    }
})()
