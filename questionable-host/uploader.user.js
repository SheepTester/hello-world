// ==UserScript==
// @name         File uploader
// @namespace    https://sheeptester.github.io/
// @version      1.0.1
// @description  Go to https://scratch.mit.edu/questionable-host to upload a file.
// @author       SheepTester
// @match        https://scratch.mit.edu/about/?questionable-host
// @icon         https://www.google.com/s2/favicons?domain=scratch.mit.edu
// @grant        none
// ==/UserScript==

;(async () => {
  'use strict'

  const HOST = 'https://sheeptester.github.io/hello-world/questionable-host'

  const { upload } = await import(HOST + '/upload-download.bundle.js')

  while (document.head.firstChild) {
    document.head.removeChild(document.head.firstChild)
  }
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }

  const iframe = document.createElement('iframe')
  iframe.src = HOST + '/upload.html'
  Object.assign(iframe.style, {
    border: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  })
  document.body.appendChild(iframe)
  document.body.scrollTo(0, 0)
  document.body.style.fontSize = 0
  document.title = 'File uploader'
  iframe.focus()
  window.addEventListener('message', ({ data }) => {
    switch (data.type) {
      case 'upload': {
        ;(async () => {
          const hashes = []
          let i = 0
          for (const blob of data.blobs) {
            const blobIndex = i
            hashes.push(
              await upload(blob, undefined, percent => {
                iframe.contentWindow.postMessage(
                  {
                    type: 'progress',
                    percent,
                    blobIndex
                  },
                  '*'
                )
              })
            )
            i++
          }
          iframe.contentWindow.postMessage(
            {
              type: 'done',
              hashes
            },
            '*'
          )
        })().catch(error => {
          console.error(error)
          iframe.contentWindow.postMessage(
            {
              type: 'error'
            },
            '*'
          )
        })
        break
      }
      default: {
        console.warn('Received a strange message.', data)
      }
    }
  })
})()
