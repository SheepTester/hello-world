// https://contacts.google.com/u/1/directory
// run the following in the console

{
const url = 'https://contacts.google.com/u/1/_/ContactsUi/data/batchexecute'
const contentType = 'application/x-www-form-urlencoded;charset=UTF-8'

// Guessing what these values mean
const requestType = 'RdqMrd'
const key = AF_initDataChunkQueue.find(chunk => chunk.key === 'ds:0').data[3]
const at = WIZ_global_data.SNlM0e

function getFReq (nextHandle, max = 5000) {
  return new URLSearchParams([
    ['f.req', JSON.stringify([[[
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
    ]]])],
    ['at', at]
  ]).toString() + '&'
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

const contacts = []
let page = { nextHandle: null }
do {
  page = await getContacts(page.nextHandle)
  console.log(page)
  contacts.push(...page.contacts)
} while (page.nextHandle)
window.contacts = contacts
console.log(contacts)
console.log(JSON.stringify(contacts))
}
