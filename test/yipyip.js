// `localStorage.Authorization_fuck2` contains value of auth header `Bearer ...`
// set `stop` to true if you want to stop

;({ Authorization_fuck2: Authorization } = localStorage)
const responses = []
let has_more = true,
  last_id,
  task_responses,
  stop = false
while (has_more && !stop) {
  ;({ has_more, last_id, task_responses } = await fetch(
    '/backend/v2/list_tasks?limit=50' + (last_id ? '&after=' + last_id : ''),
    {
      headers: { Authorization }
    }
  ).then(r => r.json()))
  responses.push(...task_responses)
  console.log(task_responses[0]?.generations?.[0]?.created_at)
  console.log(task_responses.at(-1)?.generations?.at(-1)?.created_at)
  //  break
}
responses

// pause here if you want to figure out what date to filter by

bleh = responses
  .flatMap(a => a.generations)
  .filter(g => new Date(g.created_at) >= new Date(2025, 7 - 1, 9))
//.filter(g => g.url.includes('.mp4'))
//.map(g => g.id)

// for yipyip.json
console.log(
  bleh.map(({ url, id, created_at, title }) => ({
    url,
    fileName:
      // `curl -L "${url}" -o "${
      id +
      '_' +
      created_at.replace(/\D/g, '').slice(0, 4 + 2 + 2 + 2 + 2 + 2) +
      '_' +
      title +
      url.match(/\.(?:mp4|png)/)[0]
    // }"\n`
  }))
)

// dl.sh (do not put it in this repo)
;`#!/bin/bash

set -e

${bleh
  .map(
    ({ url, id, created_at, title }) =>
      //({url,fileName:
      `curl -L "${url}" -o "${
        id +
        '_' +
        created_at.replace(/\D/g, '').slice(0, 4 + 2 + 2 + 2 + 2 + 2) +
        '_' +
        title +
        url.match(/\.(?:mp4|png)/)[0]
      }"\n`
    //})
  )
  .join('')}`
