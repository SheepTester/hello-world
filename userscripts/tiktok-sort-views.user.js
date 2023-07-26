// ==UserScript==
// @name         TikTok sort by most viewed
// @namespace    https://sheeptester.github.io/
// @version      0.1
// @description  Adds YouTube's newest/popular/latest sort options to TikTok
// @author       SheepTester
// @match        https://www.tiktok.com/@*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tiktok.com
// @grant        none
// ==/UserScript==

;(async () => {
  'use strict'

  const BUTTONS = {
    Latest: videos => {
      return videos.slice().sort((a, b) => b.id - a.id)
    },
    Oldest: videos => {
      return videos.slice().sort((a, b) => a.id - b.id)
    },
    'Most views': videos => {
      return videos.slice().sort((a, b) => b.views - a.views)
    }
  }

  // Zach King gets billions of views sometimes
  const MAGNITUDES = { K: 1e3, M: 1e6, B: 1e9 }
  function parseViews (views) {
    const match = views.match(/^(\d+(?:\.\d+)?)([KMB]?)$/)
    return +match[1] * (MAGNITUDES[match[2]] ?? 1)
  }

  const videoList = document.querySelector('[data-e2e="user-post-item-list"]')
  const getVideos = () => Array.from(videoList.children, element => {
    const videoUrl = element.querySelector('[data-e2e="user-post-item-desc"]').children[0].href
    const homePageLink = element.querySelector('a[href="https://www.tiktok.com/"]')
    if (homePageLink) {
      homePageLink.href = videoUrl
    }
    return {
      element,
      views: parseViews(element.querySelector('[data-e2e="video-views"]').textContent),
      id: +videoUrl.match(/\d+$/)[0]
    }
  })

  const sortButtons = Object.assign(document.createElement('div'), {
    className: 'sort-buttons'
  })
  for (const [label, sort] of Object.entries(BUTTONS)) {
    const button = Object.assign(document.createElement('button'), {
      className: 'sort-button',
      textContent: label
    })
    button.addEventListener('click', () => {
      document.querySelector('.sort-button-active')?.classList.remove('sort-button-active')
      button.classList.add('sort-button-active')

      const sorted = sort(getVideos())
      for (let i = 1; i < sorted.length; i++) {
        sorted[i - 1].element.after(sorted[i].element)
      }
    })
    sortButtons.append(button)
  }
  videoList.before(sortButtons)

  document.head.insertAdjacentHTML('beforeend', `<style>
  .sort-buttons {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
  }
  .sort-button {
    color: inherit;
    border: 1px solid rgba(22, 24, 35, 0.12);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, .08);
    height: 36px;
    font-weight: 600;
    font-size: 16px;
    padding: 0 16px;
    line-height: 24px;
    cursor: pointer;
  }
  .sort-button:not(.sort-button-active):hover {
    background-color: rgba(255, 255, 255, .04);
  }
  [data-theme="light"] .sort-button:not(.sort-button-active):hover {
    background-color: rgba(22, 24, 35, .03);
  }
  .sort-button-active {
    border-color: transparent;
    color: white;
    background-color: #ff3b5c;
  }
  .sort-button-active:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.06));
  }
  </style>`)
})()
