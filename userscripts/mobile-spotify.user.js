// ==UserScript==
// @name         Spotify on Firefox mobile
// @namespace    https://sheeptester.github.io/
// @version      0.1.3
// @description  get spotify desktop to work on firefox mobile
// @author       Sean
// @match        *://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

!function () {
    'use strict'

    Object.defineProperty(window, 'devicePixelRatio', {
        get () {
            //console.log(new Error('dpr'))
            return 1
        }
    })
    Object.defineProperty(navigator, 'userAgent', {
        get () {
            //console.log(new Error('ua'))
            return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        }
    })
    Object.defineProperty(navigator, 'userAgentData', {
        get () {
            //console.log(new Error('ua'))
            return {
                "brands": [
                    {
                        "brand": "Chromium",
                        "version": "134"
                    },
                    {
                        "brand": "Not:A-Brand",
                        "version": "24"
                    },
                    {
                        "brand": "Google Chrome",
                        "version": "134"
                    }
                ],
                "mobile": false,
                "platform": "Windows"
            }
        }
    })
    Object.defineProperty(navigator, 'platform', {
        get () {
            console.log(new Error('platform'))
            return 'Win32'
        }
    })
    Object.defineProperty(navigator, 'appVersion', {
        get () {
            console.log(new Error('appVersion'))
            return '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        }
    })

    Object.defineProperty(location, 'reload', {
        get () {
            return () => alert('reload attempted')
        }
    })

    window.addEventListener("beforeunload", function (e) {
        var confirmationMessage = 'It looks like you have been editing something. '
        + 'If you leave before saving, your changes will be lost.';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });
}()
