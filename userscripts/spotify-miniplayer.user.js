// ==UserScript==
// @name         spotify mini player (userscript version)
// @namespace    https://sheeptester.github.io/
// @version      1.0.0
// @description  for when stylus is disabled :/
// @author       sean
// @match        https://open.spotify.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spotify.com
// @run-at document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const og = documentPictureInPicture.requestWindow.bind(documentPictureInPicture)
    documentPictureInPicture.requestWindow = (...args) => og(...args).then(win => {
        win.document.documentElement.append(Object.assign(win.document.createElement('style'), {
            textContent: `.U7qJ1UbUI0C76xXqYVQY {
        display: none;
    }
    [data-testid="document-pip-hover-element"] {
        opacity: 1;
    }`
        }))
        return win
    })
    console.log(documentPictureInPicture.requestWindow)
})();
