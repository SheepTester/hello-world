// deno run --allow-run --allow-write ucsd-commencement-voices/ffmpeg-list.ts

import { voices } from './voices.ts'

let file = ''

for (const name of Object.values(voices)) {
  // https://superuser.com/a/787651
  // console.log(`file 'images/${name.replaceAll("'", String.raw`'\''`)}.png'`)
  // console.log(`file 'audio/${name.replaceAll("'", String.raw`'\''`)}.mp3'`)

  await new Deno.Command('ffmpeg', {
    args: [
      '-i',
      `ucsd-commencement-voices/audio/${name}.mp3`,
      '-i',
      `ucsd-commencement-voices/images/${name}.png`,
      '-y',
      `ucsd-commencement-voices/video/${name}.mp4`
    ]
  }).output()
  file += `file 'video/${name.replaceAll("'", String.raw`'\''`)}.mp4'\n`
}

await Deno.writeTextFile('ucsd-commencement-voices/list.txt', file)
console.log(
  'ffmpeg -f concat -safe 0 -i ucsd-commencement-voices/list.txt -c copy -y ucsd-commencement-voices/output.mp4'
)
