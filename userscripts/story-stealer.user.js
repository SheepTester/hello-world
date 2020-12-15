// ==UserScript==
// @name         Instagram story stealer
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  (ctrl/cmmd) + M when viewing an Instagram story to open the video/image in new tab
// @author       Sean
// @match        https://www.instagram.com/*
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener("keydown", e => {
        if (e.keyCode === 77 && (e.ctrlKey || e.metaKey)) {
            let parent = document.elementFromPoint(innerWidth / 2, innerHeight / 2), video, image;
            while (parent.parentElement && !(video || image)) {
                video = parent.querySelector("video source");
                image = parent.querySelector("img");
                parent = parent.parentElement;
            }
            if (video) GM_openInTab(video.getAttribute("src"));
            if (image) {
                try {
                    GM_openInTab(image.getAttribute('srcset').split(',')[0].split(' ')[0]);
                } catch (err) {
                    GM_openInTab(image.getAttribute("src"));
                }
            }
        }
    }, false);
})();
