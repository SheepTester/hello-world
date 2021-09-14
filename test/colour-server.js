const express = require('express')
const app = express()

app.get('/:colour', (req, res) => {
  const { colour } = req.params
  console.log('get colour', colour)
  res.send(`
    <title>Learn about the significance of #${colour}</title>
    <meta name="description" content="${new Date()}"/>
    <meta name="theme-color" content="#${colour}"/>
    <body style="background-color: #${colour};">
  `)
})

app.listen(10068)
