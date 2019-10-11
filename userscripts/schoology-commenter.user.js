// ==UserScript==
// @name         Schoology commenter
// @version      1.1
// @description  ctrl/cmmd + click to open comments page to bypass comment restrictions
// @author       sheep
// @match        *://*.schoology.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('click', e => {
        if (!(e.ctrlKey || e.metaKey)) return;
        let target = e.target;
        while (!(target === null || target.id && target.id.slice(0, 11) === 'edge-assoc-')) target = target.parentNode;
        if (target !== null) {
            window.location = `https://pausd.schoology.com/update_post/${target.querySelector('[id^=s-like-n-]').id.slice(9)}/comments`;
        }
    });

    if (window.location.pathname.slice(0, 13) === '/update_post/') {
        const btn = document.getElementById('edit-submit');
        btn.disabled = false;
        btn.parentNode.classList.remove('disabled');
    }
})();
