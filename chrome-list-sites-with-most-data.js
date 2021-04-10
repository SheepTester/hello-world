// chrome://settings/siteData
function parseSize({size}){
return size ? parseFloat(size.replace(',', ''))
*(size.includes('KB') ? 1_000
: size.includes('MB') ? 1_000_000
: size.includes('GB') ? (console.log(size),1_000_000_000)
: 1) : 0
}
let {sendWithPromise} = await import("chrome://resources/js/cr.m.js")
(await sendWithPromise('localData.getDisplayList', '')
.then(({ items: sites}) => Promise.all(sites.map(({ site, localData}) => sendWithPromise('localData.getCookieDetails', site).then(r => ({site,...r})))))).map(a => ({
size: a.children.map(parseSize).reduce((a, b) => a + b, 0),
...a
})).sort((a, b) => b.size - a.size).map(a => `${a.site} · ${a.size} B`)
