const tellServer = content =>
  fetch(
    'https://discord.com/api/webhooks/986454683415633920/8TShTmiurZLDq8bv726i1IbR9eQovH_jc4uG7PVEqsLU_w-acD5Fw2dmPLwminhVGya9',
    {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: { 'Content-Type': 'application/json' }
    }
  )

const url =
  'https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?selectedTerm=SP23&tabNum=tabs-crs&courses=CHEM+43A'

async function main () {
  let lastHtml = await fetch(url).then(r => r.text())
  let lastCount = [...lastHtml.matchAll(/<\/td>/g)].length
  await tellServer(
    'the script is running.. i wont say if i die though <:bblush:970872448255946842>'
  )

  setInterval(async () => {
    const html = await fetch(url).then(r => r.text())
    const count = [...lastHtml.matchAll(/<\/td>/g)].length
    console.log(lastHtml !== html ? 'change' : 'no change')
    if (lastHtml !== html) {
      lastHtml = html
      await tellServer('‼️  curious.. the page code has CHANGED')
    }
    if (lastCount !== count) {
      await tellServer(
        `‼️‼️ curious AND furious!! we have gone from ${lastCount} to ${(lastCount =
          count)} rows.. <@701854513866473532> <@212355530474127361> takee a look at this`
      )
    }
  }, 5 * 60 * 1000)
}

main()
