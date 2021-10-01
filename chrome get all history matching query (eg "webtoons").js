{
const {B: BrowserService } =await import('./shared.rollup.js')
const browserService = BrowserService.getInstance();
const values = []
let {value,info: { finished } } =await browserService.queryHistory('webtoons')
while (!finished) {
values.push(...value)
;({value,info: { finished } } =await browserService.queryHistoryContinuation())
}
const wow = []
for (const { allTimestamps: all, title, url } of values) {
for (const time of all) {
wow.push({ time: new Date(time), title, url })
}
}
wow.sort((a, b) => a.time - b.time).map(({time, title, url}) => `${time.toDateString()}\t${title}\t${url}\t${time.toTimeString().split(' ')[0]}`).join('\n')
}
