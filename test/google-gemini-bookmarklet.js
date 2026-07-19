// set false -> true at the end to get source
(function x(getsrc){
    if (getsrc){
//running in console, return code
        return `javascript:${encodeURI(`(${x})()`)}`
        }
    const shet = new CSSStyleSheet()
 console.time('shet')
 shet.replaceSync(`library-item-card  {&>*{pointer-events: none};cursor: pointer}`)
 console.timeEnd('shet')
document.adoptedStyleSheets = [...document.adoptedStyleSheets, shet]
document.addEventListener('click', async e => {
    const thing = e.target.closest('library-item-card')
    if (!thing) return
    const src = thing.querySelector('img').src
    const i = src.lastIndexOf('=')
    let url = src.slice(0, i) + '=d-I?alr=yes'
    let response = await fetch(url)
    let download
    if (!response.ok) return
    if (response.headers.get('content-type')!=='image/png'){
    url = await response.text()
    url = await fetch(url, { "credentials": "include" }).then(r => r.text()).catch(() => console.error('failed to fetch second url',url))
     response = await fetch(url)
    if (!response.ok) return
        download=''
    }
    else {
        url = URL.createObjectURL(await response.blob())
        download = src.slice(0, i).split('/').at(-1)
    }
    const a = document.createElement('a')
    a.href = url
    a.download =download //JSON.parse( response.headers.get('content-disposition')?.split('=')[1] ?? '""')
    // console.log(...response.headers.entries())
    document.body.append(a)
  //  thing.style.filter=`hue-rotate(${Math.random()*300+30}deg)`
    a.click()
    thing.style.opacity = 0.5
    a.remove()
    URL.revokeObjectURL(url)
})
})(true)
