// curl 'https://finance.ucsd.edu/Home/UpdateTerm'   -H 'Content-Type: application/x-www-form-urlencoded'   -H 'Referer: https://finance.ucsd.edu/Home/ListFunded'  --data-raw 'FinanceTerm=1021' -L  > fin.html

const cookies = await fetch('https://finance.ucsd.edu/Home/UpdateTerm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: 'https://finance.ucsd.edu/Home/ListFunded'
  },
  body: 'FinanceTerm=1021'
}).then(r => r.headers.getSetCookie())
console.log(cookies)
