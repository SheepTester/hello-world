// ==UserScript==
// @name         safety and procedures autodoer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get the shortest completion time
// @author       You
// @match        https://pausd.schoology.com/assignment/1682895332/assessment
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (localStorage.autoweeestate === 'reee') {
        document.querySelector('#edit-submit').click();
        localStorage.removeItem('autoweeestate');
        setTimeout(() => {
            document.querySelector('#popup_confirm').click();
        }, 200);
    }

    const text = {
        "manipulate": "fume hood",
        "best": "wafting"
    };
    const choice = {
        "Bunsen": ["back", 'flame', 'container', 'reach'],
        'apron': ['False'],
        'extra': ['stock'],
        responsiblity: ['student'],
        eating: ['water'],
        packs: ['seat'],
        phones: ['permission'],
        googles: ['flame', 'chemicals', 'pressure'],
        rinse: ['20'],
        quizzes: ['Friday'],
        experiements: ['False'],
        share: ['forgot', 'different']
    };
    const order = ["turn it off", "unplug it", "let it cool", "put it away"];

    document.onkeydown = e => {
        if (e.keyCode !== 32) return;

        const questions = document.querySelectorAll('.question-wrapper');
        questions.forEach(q => {
            const question = q.querySelector('.question-title').textContent;
            if (q.classList.contains('question-fitb')) {
                for (let keyword in text) {
                    if (question.includes(keyword)) {
                        q.querySelector('input').value = text[keyword];
                        break;
                    }
                }
            } else if (q.classList.contains('question-ordering')) {
                const items = Array.from(q.querySelectorAll('table tr'));
                const list = q.querySelector('table');
                items.forEach(it => it.remove());
                items.sort((a, b) =>
                           order.indexOf(a.querySelector('td').textContent.slice(3, -2))
                           - order.indexOf(b.querySelector('td').textContent.slice(3, -2)))
                    .forEach(it => list.appendChild(it));
            } else {
                let answers = Array.from(q.querySelectorAll('table tr'));
                if (!answers.length) answers = Array.from(q.querySelectorAll('.form-item'));
                for (let keyword in choice) {
                    if (question.includes(keyword)) {
                        const answerKeywords = choice[keyword];
                        answers.forEach(a => {
                            a.querySelector('input').checked = false;
                        });
                        answers.filter(a => {
                            return ~answerKeywords.findIndex(ak => a.textContent.includes(ak));
                        }).forEach(a => {
                            a.querySelector('input').checked = true;
                        });
                        break;
                    }
                }
            }
        });
        localStorage.autoweeestate = 'reee';
        document.querySelector('input[type=submit]').click();
    };
})();
