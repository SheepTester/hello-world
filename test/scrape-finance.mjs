import fs from 'fs/promises'

console.error('set term')
const cookie = await fetch('https://finance.ucsd.edu/Home/UpdateTerm', {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    referer: 'https://finance.ucsd.edu/Home/ListFunded'
  },
  redirect: 'manual',
  body: 'FinanceTerm=1021'
}).then(r =>
  r.headers
    .getSetCookie()
    .map(cookie => cookie.split('; path=')[0])
    .join('; ')
)
console.error('get table', cookie)
const html = await fetch('https://finance.ucsd.edu/Home/ListFunded', {
  headers: { cookie }
}).then(r => r.text())
console.error(html.length)
await fs.writeFile('/home/sheep/fin.html', html)
// console.log(html)
// process.exit()
