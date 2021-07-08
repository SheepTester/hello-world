const express = require('express')
const expressWs = require('express-ws')
const path = require('path')

const app = express()
expressWs(app)

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'))
})

app.get('/test.js', (req, res) => {
  res.send(`//# sourceMappingURL=./test.js.map?id=${req.query.id}`)
})

const callbacks = new Map()

app.get('/test.js.map', (req, res) => {
  const callback = callbacks.get(req.query.id)
  if (callback) {
    callback()
  }
  res.send('ok')
})

app.ws('/', ws => {
  const id = Date.now().toString(36) + Math.random().toString(36)
  ws.send(id)
  callbacks.set(id, () => {
    callbacks.delete(id)
    ws.send('[ok]')
    ws.close()
  })
  ws.on('close', () => {
    callbacks.delete(id)
  })
})

app.listen(3000, () => {
  console.log(`http://localhost:3000/`)
})
