// ==UserScript==
// @name         auto sign into guest PAUSD wifi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://cppm-1.pausd.org/guest/pausdregistrationpage1.php?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var NAME="Leuf Munkler",
       EMAIL="dont@email.us";
    document.querySelector('input[name="visitor_name"]').value=NAME;
    document.querySelector('input[name="email"]').value=EMAIL;
    document.querySelector('input[name="creator_accept_terms"]').checked=true;
    document.querySelector('input[type="submit"]').click();
})();

// ==UserScript==
// @name         auto click log in for guest PAUSD wifi
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://cppm-1.pausd.org/guest/pausdregistrationpage1_receipt.php
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.querySelector('input[type="submit"]').click();
})();

// ==UserScript==
// @name         auto redirect pausd redirect page elsewhere
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://captiveportal-login.pausd.org/cgi-bin/login
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.location="https://google.com";
})();
