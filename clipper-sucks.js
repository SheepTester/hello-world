const citNum = process.argv[2]
const webhook = process.argv[3]
console.log('asking about', citNum, 'will update', webhook)

let i = 0
setInterval(() => {
  fetch('https://www.pticket.com/scripts/Autobahn.exe/Execute', {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    },
    body:
      'parmAGENCY_STATE=CA&parmAGENCY_COUNTY=%7BsubAGENCY_COUNTY%7D&parmAGENCY_LOC=CALTRAIN&parmINQFLAG=1+&parmCITATION_NUM=' +
      citNum +
      '&SUBMIT0.x=55&SUBMIT0.y=18&Application=pTicket&Program=REPORT-citation_list&DSI=0',
    method: 'POST'
  }).then(r =>
    r.text().then(async html => {
      if (html.includes('No citations match the supplied criteria.')) {
        process.stdout.write('no citation ')
        i++
        if (i >= 10) {
          i = 0
          process.stdout.write('\r')
        }
        return
      }
      if (html.includes('Unable to contact Speedware Autobahn')) {
        process.stdout.write('ratelimited ')
        i++
        if (i >= 10) {
          i = 0
          process.stdout.write('\r')
        }
        return
      }
      await fetch(webhook, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          content: `hey <@212355530474127361> you can pay now (status code: ${
            r.status
          })\n\n\`\`\`html\n${html.slice(0, 1000)}\n\`\`\``
        })
      })
      console.log('\ndone :)')
      process.exit(0)
    })
  )
}, 10)
