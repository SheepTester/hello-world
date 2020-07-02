// ==UserScript==
// @name         Set Fun Ruiner
// @namespace    https://sheeptester.github.io/
// @version      1.0
// @description  Ruin the fun of Set with Friends; press ctrl + M to autoselect a set
// @author       sheeptester
// @match        *://setwithfriends.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const colours = {
        '#008002': 'green',
        '#00b803': 'green',
        '#ff0101': 'red',
        '#ffb047': 'red',
        '#800080': 'purple',
        '#ff47ff': 'purple'
    }
    function getCards () {
        const cardElems = document.querySelectorAll('div[style*="visibility: visible;"] > div[class^="jss"]')
        return Array.from(cardElems, elem => {
            const shape = elem.firstElementChild
            const [fill, outline] = shape.children
            return {
                number: elem.children.length,
                colour: colours[outline.getAttributeNS(null, 'stroke')],
                shape: fill.getAttributeNS(null, 'href').slice(1),
                shade: fill.getAttributeNS(null, 'mask') === 'url(#mask-stripe)'
                    ? 'striped'
                    : fill.getAttributeNS(null, 'fill') === 'transparent'
                        ? 'solid' : 'outline',
                select: () => elem.click()
            }
        })
    }

    function noPairInCommon(propA, propB, propC) {
        return propA === propB && propB === propC ||
            propA !== propB && propB !== propC && propA !== propC
    }

    const properties = ['number', 'colour', 'shape', 'shade']
    function isSet(a, b, c) {
        for (const prop of properties) {
            if (!noPairInCommon(a[prop], b[prop], c[prop])) return false
        }
        return true
    }

    function identifySet (cards) {
        for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    let maybeSet = [cards[i], cards[j], cards[k]]
                    if (isSet(...maybeSet)) {
                        return maybeSet
                    }
                }
            }
        }
        return null
    }

    window.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            const cards = identifySet(getCards())
            if (cards) {
                for (const card of cards) card.select()
            } else {
                alert('No set found :(')
            }
        }
    })
})()
