// set false -> true at the end to get source
;(function x (getsrc) {
  if (getsrc) {
    //running in console, return code
    return `javascript:${encodeURI(`(${x})()`)}`
  }
  const data = (window.__data246653 ??= new WeakSet())
  document.removeEventListener('pointerdown', window.__lasthandler)
  document.removeEventListener('pointerdown', window.__lasthandler, {
    capture: true
  })
  window.__lasthandler = () => {
    try {
      const images = [...document.querySelectorAll('flow-grid-tile-container')]
      const reuseBtns = [...document.querySelectorAll('.reuse-prompt-button')]
      for (const link of images) {
        if (data.has(link)) continue
        const url = new URL(link.querySelector('img,video').src)
        link.href = url
        let wow = link.querySelector('.footer-title').textContent
        if (!wow) {
          console.warn(link)
        }
        const realLink = document.createElement('a')
        link.addEventListener(
          'click',
          async e => {
            if (e.target !== e.currentTarget) return
            e.stopPropagation()
            e.preventDefault()
            link.querySelector('[aria-label="More options"]').click()
            Iterator.from(document.querySelectorAll('flow-menu-item button'))
              .find(
                btn => btn.querySelector('.label')?.textContent === 'Download'
              )
              .click()
            Iterator.from(document.querySelectorAll('flow-menu-item button'))
              .find(
                btn =>
                  btn.querySelector('.caption')?.textContent.trim() ===
                  'Original size'
              )
              .click()
            // const blob = await fetch(url).then(r => r.blob())
            // realLink.href = URL.createObjectURL(blob)
            // const h = () =>
            link.style.filter = `hue-rotate(${Math.random() * 300 + 30}deg)`
            // h()
            // document.body.append(realLink)
            // realLink.click()
            // realLink.remove()
            // link.onclick = e => (e.stopPropagation(), h())
          },
          { capture: true }
        )
        realLink.download = `${wow} ${url.searchParams.get('name')}`
        data.add(link)
      }
      for (const link of reuseBtns) {
        let btn = link.parentNode.previousElementSibling
        if (!btn) {
          console.error('expected to find prompt next to button', link)
          continue
        }
        if (data.has(btn) && btn.onclick) continue
        if (data.has(btn) && !btn.onclick)
          console.warn('lost onclick', link, btn)
        btn.onclick = e => {
          /* e.stopPropagation()*/
          navigator.clipboard.writeText(btn.textContent)
          btn.style.color = `hsl(${Math.random() * 360},50\x25,50\x25)`
        }
        data.add(btn)
      }
    } catch (error) {
      console.error('error in window.__lastHandler', error)
    }
  }
  document.addEventListener('pointerdown', window.__lasthandler, {
    capture: true
  })
  document.onclick = e => {
    if (!e.shiftKey) return
    const btn = e.target.closest('button')
    if (btn?.textContent === 'deleteDelete' && e.shiftKey) {
      requestAnimationFrame(() => {
        const confirmDel = document.querySelector(
          '[role="dialog"] :last-child > [data-type="button-overlay"]'
        ).parentNode
        if (confirmDel.textContent !== 'Delete')
          return alert(confirmDel.textContent)
        confirmDel.click()
      })
    }
  }
  const sheet = [...document.styleSheets].at(-1)
  sheet.insertRule(
    '[style="overflow-anchor: none;"] > [style*="translate3d"] { transform: none !important; }'
  )
  sheet.insertRule(
    'flow-grid-tile-container { pointer-events: auto !important }'
  )
  sheet.insertRule(
    'flow-grid-tile-container * { pointer-events: none !important }'
  )
})(false)
