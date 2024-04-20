// deno run --allow-net --allow-write ucsd-commencement-voices/download.ts

import { voices } from './voices.ts'

const text = 'Sean'

function waitUntil (time: number): Promise<void> {
  return new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (Date.now() >= time) {
        clearInterval(intervalId)
        resolve()
      }
    })
  })
}

function expect (message: string): never {
  throw new TypeError(`Expected a non-nullish value: ${message}`)
}

for (const [speaker_id, name] of Object.entries(voices)) {
  const response = await fetch('https://api.wellsaidlabs.com/v1/tts/stream', {
    headers: {
      'content-type': 'application/json',
      'x-api-key': '79b7cc92-baa3-4ef6-8f8d-d50f2cdaefa3'
    },
    body: JSON.stringify({ speaker_id, text }),
    method: 'POST'
  })
  if (!response.body) {
    throw new Error('Why no response body')
  }
  await Deno.writeFile(
    `ucsd-commencement-voices/audio/${name}.mp3`,
    response.body
  )
  if (
    +(
      response.headers.get('X-Rate-Limit-Remaining') ??
      expect('X-Rate-Limit-Remaining')
    ) <= 1
  ) {
    const date = +(
      response.headers.get('X-Rate-Limit-Reset') ?? expect('X-Rate-Limit-Reset')
    )
    console.log('Waiting for ratelimit reset.', new Date(date))
    await waitUntil(date)
  }
}
