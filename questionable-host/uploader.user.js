// ==UserScript==
// @name         File uploader
// @namespace    https://sheeptester.github.io/
// @version      1.1.0
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

  const main = document.getElementById('view')
  while (main.firstChild) {
    main.removeChild(main.firstChild)
  }
  const sheet =
    window.document.styleSheets[window.document.styleSheets.length - 1]
  sheet.insertRule('#view { padding: 0; }', sheet.cssRules.length)
  sheet.insertRule(':root { color-scheme: dark; }', sheet.cssRules.length)

  const iframe = document.createElement('iframe')
  iframe.src = HOST + '/upload.html'
  Object.assign(iframe.style, {
    border: 'none',
    width: '100%',
    height: 'calc(100vh - 50px)',
    minHeight: '680px'
  })
  main.appendChild(iframe)
  document.body.scrollTo(0, 0)
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
