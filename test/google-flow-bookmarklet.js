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
        let wow = (wow = [
          ...link.nextElementSibling.querySelectorAll('i + div')
        ].at(-1).textContent)
        if (!wow) {
          console.warn(link)
        }
        link.addEventListener(
          'click',
          async e => {
            e.stopPropagation()
            e.preventDefault()
            const blob = await fetch(url).then(r => r.blob())
            link.href = URL.createObjectURL(blob)
            const h = () =>
              (link.style.filter = `hue-rotate(${Math.random() * 300 + 30}deg)`)
            h()
            link.click()
            link.onclick = e => (e.stopPropagation(), h())
          },
          { capture: true }
        )
        link.download = `${wow} ${url.searchParams.get('name')}`
        data.add(link)
      }
      for (const link of reuseBtns) {
        let btn = link.parentNode.previousElementSibling
        console.log('wow', btn)
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
  ;[...document.styleSheets]
    .at(-1)
    .insertRule(
      '[style="overflow-anchor: none;"] > [style*="translate3d"] { transform: none !important; }'
    )
})(false)
