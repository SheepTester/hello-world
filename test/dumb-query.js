const express = require('express')
const app = express()

function escape (str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

app.get('/', (req, res) => {
  res.send(`
<title>${escape(JSON.stringify(req.query))}</title>
    <meta name="description" content="Gamepro5 is big ${new Date().toLocaleString()} ${Math.random()}"/>
  `)
})

app.listen(10068)
