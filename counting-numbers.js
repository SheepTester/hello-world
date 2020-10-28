const express = require('express')
const app = express()
const port = 10068

app.get('/', async (req, res) => {
  let i = 1
  let timeoutId
  function loop () {
    res.write(i + '\n')
    i++
    timeoutId = setTimeout(loop, i)
  }
  res.status(200).set('Content-Type', 'text/plain')
  loop()
  req.on('close', () => {
    clearTimeout(timeoutId)
    res.end()
    console.log(`Request cancelled at ${i}`)
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

