// https://contacts.google.com/u/1/directory
// run the following in the console

// If using test/stream-to-file-ws.ts, put the websocket server URL here:
const ws = null // new WebSocket('ws://localhost:8080/contacts.json')

const url = 'https://contacts.google.com/u/1/_/ContactsUi/data/batchexecute'
const contentType = 'application/x-www-form-urlencoded;charset=UTF-8'

// Guessing what these values mean
const requestType = 'RdqMrd'
const key = AF_initDataChunkQueue.find(chunk => chunk.key === 'ds:0').data[3]
const at = WIZ_global_data.SNlM0e

function getFReq (nextHandle, max = 5000) {
  return (
    new URLSearchParams({
      'f.req': JSON.stringify([
        [
          [
            requestType,
            JSON.stringify([
              null,
              nextHandle,
              // Number of results
              max,
              key
            ]),
            null,
            'generic'
          ]
        ]
      ]),
      at
    }) + '&'
  )
}
async function getContacts (nextHandle = null) {
  const [contacts, nextNextHandle] = await fetch(url, {
    headers: {
      'Content-Type': contentType
    },
    body: getFReq(nextHandle),
    method: 'POST'
  })
    .then(r => r.text())
    .then(t => JSON.parse(JSON.parse(t.replace(/^[^[{]+/, ''))[0][2]))
  return {
    contacts: contacts || [],
    nextHandle: nextNextHandle
  }
}

if (ws) {
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
}
const contacts = []
let page = { nextHandle: null }
let first = true
do {
  page = await getContacts(page.nextHandle)
  console.log(page)
  if (ws) {
    ws.send(
      page.contacts
        .map(
          (contact, i) =>
            `${first && i === 0 ? '[' : ','} ${JSON.stringify(
              contact,
              null,
              '\t'
            ).replace(/\s*\n\s*/g, ' ')}\n`
        )
        .join('')
    )
    first = false
  } else {
    contacts.push(...page.contacts)
  }
} while (page.nextHandle)
if (ws) {
  ws.send(']\n')
  ws.close()
} else {
  window.contacts = contacts
  console.log(contacts)
  console.log(JSON.stringify(contacts))
}
