// deno run ucsd-commencement-voices/ffmpeg-list.ts > ucsd-commencement-voices/list.txt

import { voices } from './voices.ts'

for (const name of Object.values(voices)) {
  console.log(`file 'audio/${name}.mp3'`)
  console.log(`file 'images/${name}.png'`)
}
