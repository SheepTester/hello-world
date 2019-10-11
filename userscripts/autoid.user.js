// ==UserScript==
// @name         Auto-sign in to RapidIdentity
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Automatically sign in to RapidIdentity
// @author       Sean
// @match        https://id.pausd.org/idp/AuthnEngine*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var timeout = setInterval(() => {
        var username = document.querySelector("#identification");
        if (!username) return;
        username.value = "STUDENT ID";
        username.dispatchEvent(new Event("blur"));
        document.querySelector("#authn-go-button").click();
        clearInterval(timeout);
        timeout = setInterval(() => {
            var password = document.querySelector("[type=password]");
            if (!password) return;
            password.value = "PASSWORD HERE";
            password.dispatchEvent(new Event("blur"));
            document.querySelector("#authn-go-button").click();
            clearInterval(timeout);
        }, 50);
    }, 50);
})();
