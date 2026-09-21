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
  console.log('fdgdfg', console.error)
  console.error('hello??')
  window.__lasthandler = () => {
    const images = [...document.querySelectorAll('flow-grid-tile-container')]
    const reuseBtns = [...document.querySelectorAll('.reuse-prompt-button')]
    console.log('setting up.', images.length, reuseBtns.length)
    for (const link of images) {
      console.log('??', link, images)
      if (data.has(link)) continue
      console.log('hello')
      const url = new URL(link.querySelector('img,video').src)
      link.href = url
      console.log('hi1')
      let wow
      try {
        wow = [...link.nextElementSibling.querySelectorAll('i + div')].at(
          -1
        ).textContent
      } catch (error) {
        console.log('wtf', error)
        console.error('?a??')
        console.warn('???b')
        throw error
      }
      console.log('hi2')
      if (!wow) {
        console.warn(link)
      }
      console.log('hi3')
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
      console.log('hi4')
      link.download = `${wow} ${url.searchParams.get('name')}`
      console.log('hi5')
      data.add(link)
      console.log('hi')
    }
    for (const link of reuseBtns) {
      let btn = link.parentNode.previousElementSibling
      console.log('wow', btn)
      if (!btn) {
        console.error('expected to find prompt next to button', link)
        continue
      }
      if (data.has(btn) && btn.onclick) continue
      if (data.has(btn) && !btn.onclick) console.warn('lost onclick', link, btn)
      btn.onclick = e => {
        /* e.stopPropagation()*/
        navigator.clipboard.writeText(btn.textContent)
        btn.style.color = `hsl(${Math.random() * 360},50\x25,50\x25)`
      }
      data.add(btn)
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
