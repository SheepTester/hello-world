// ==UserScript==
// @name         Instagram story stealer
// @namespace    https://sheeptester.github.io/
// @version      2.0.0
// @description  (ctrl/cmmd) + M when viewing an Instagram story to open the video/image in new tab
// @author       Sean
// @match        https://www.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    // Tampermonkey runs in a sandbox where `window` is a Proxy
    const win = document.defaultView
    const OriginalXhr = win.XMLHttpRequest
    //console.log(window, self, globalThis, this, document.defaultView, XMLHttpRequest)
    const stories = []
    win.XMLHttpRequest = class MyXhr extends OriginalXhr {
        constructor (...args) {
            super(...args)
            this.addEventListener('readystatechange', e => {
                if (this.readyState === OriginalXhr.DONE && this.responseURL === "https://www.instagram.com/graphql/query") {
                    const json = JSON.parse(this.responseText)
                    console.log(json.data)
                    if (json.data.xdt_api__v1__feed__reels_media__connection) {
                        stories.push(...json.data.xdt_api__v1__feed__reels_media__connection.edges)
                    }
                }
            })
        }
    }
    /*Object.defineProperty(win, 'XMLHttpRequest', {
        get () {
            console.log('get xhr')
        },
        set (value) {
            console.log('set xhr', value, new Error('someone tried to set xhr'))
        },
        writable: false
    })*/

    const pattern = new URLPattern({ pathname: "/stories/:userid/:storyid/" });
    const pattern2 = new URLPattern({ pathname: "/stories/:userid/" }); // will just default to first unseen story
    document.addEventListener("keydown", e => {
        if (e.keyCode === 77 && (e.ctrlKey || e.metaKey)) {
            const match = pattern.exec(window.location.href) ?? pattern2.exec(window.location.href)
            if (match) {
                const { userid, storyid = null } = match.pathname.groups
                console.log(stories)
                const matches = stories.filter(user => user.node.user.username === userid)
                .flatMap(user => user.node.items.filter(story => storyid === null ? user.node.seen < story.taken_at : story.pk === storyid))
                console.log(userid, storyid, matches)
                if (matches[0]) {
                    const { image_versions2: { candidates }, video_dash_manifest } = matches[0]
                    if (video_dash_manifest) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(video_dash_manifest, "application/xml");
                        console.log(doc)
                        const {url } = Array.from(doc.querySelectorAll('Representation[mimeType^="video/"]')).reduce((cum, curr) => {
                            const width = +curr.getAttribute('width')
                            const url = curr.querySelector('BaseURL').textContent
                            if (width > cum.width) return {width,url}
                            else return cum
                        }, { width: 0 })
                        GM_openInTab(url)
                        const audioUrl = doc.querySelector('Representation[mimeType^="audio/"] BaseURL').textContent
                        GM_openInTab(audioUrl)
                        prompt('ffmpeg merge', `ffmpeg -i '${url}' -i '${audioUrl}' output.mp4`)
                    } else {
                        const { url } = candidates.reduce((cum, curr) => curr.width !== curr.height && curr.width > cum.width ? curr : cum, { width: 0 })
                        GM_openInTab(url)
                    }
                } else {
                    alert(`Couldn't find story from @${userid}, ID ${storyid ?? 'unknown'}`)
                }
            } else {
                let parent = document.elementFromPoint(innerWidth / 2, innerHeight / 2), video, image;
                // TODO
            }
        }
    }, false);
})();
