function getFReq (nextHandle, max = 300) {
  return new URLSearchParams([
    ['f.req', JSON.stringify([[[
      'RdqMrd',
      JSON.stringify([
        null,
        nextHandle,
        // Number of results
        max,
        'CIa0kYCm0e4C'
      ]),
      null,
      'generic'
    ]]])],
    ['at', 'ACHfmao4TKfPTvnYrL2OOfrwJNGp:1612478362900']
  ]).toString() + '&'
}
async function getContacts (nextHandle = null) {
  const [contacts, nextNextHandle] = await fetch('https://contacts.google.com/u/1/_/ContactsUi/data/batchexecute?rpcids=RdqMrd&f.sid=-6567574267548801005&bl=boq_contactsuiserver_20210131.18_p0&hl=en&soc-app=527&soc-platform=1&soc-device=1&_reqid=1352765&rt=c', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: getFReq(nextHandle),
    method: 'POST',
  })
    .then(r => r.text())
    .then(t => JSON.parse(JSON.parse(t.split(/\r?\n/).slice(3, 5).join(''))[0][2]))
  return { contacts, nextHandle: nextNextHandle }
}
a = await getContacts()
console.log(a.contacts, (await getContacts(a.nextHandle)).contacts)
