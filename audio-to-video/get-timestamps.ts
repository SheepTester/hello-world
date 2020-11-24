/**
 * I should merge this with audio-to-video.ts.
 * deno run --allow-read=./ --allow-run get-timestamps.ts
 * or
 * deno run --allow-read=./ --allow-run get-timestamps.ts > timestamps.txt
 */

import { getAudio, AudioEntry } from './get-audio.ts'
const audio: Map<string, AudioEntry> = await getAudio()

const decoder = new TextDecoder()

function leadingZero (number: number): string {
  return number.toString().padStart(2, '0')
}
function secondsToTimeStamp (time: number): string {
  const hours: number = Math.floor(time / (60 * 60))
  const minutes: number = Math.floor(time / 60) % 60
  const seconds: number = Math.floor(time % 60)
  return hours === 0
    ? `${minutes}:${leadingZero(seconds)}`
    : `${hours}:${leadingZero(minutes)}:${leadingZero(seconds)}`
}

interface FFProbeOutput {
  format: {
    duration: string
  }
}

let totalTime: number = 0
for (const fileName of audio.keys()) {
  console.log(`${secondsToTimeStamp(totalTime)} ${fileName}`)
  const process = Deno.run({
    cmd: [
      'ffprobe',
      // File to check the length of
      '-i', `./parts/${fileName}.mp4`,
      // Show the "duration" entry under the section "FORMAT"
      '-show_entries', 'format=duration',
      // Output JSON
      '-print_format', 'json',
      // Do not log anything else
      '-v', 'quiet'
    ],
    stdout: 'piped'
  })
  const { code } = await process.status()
  if (code === 0) {
    const { format: { duration } }: FFProbeOutput = JSON.parse(decoder.decode(await process.output()))
    totalTime += +duration
  } else {
    throw new Error('Sadness! ' + code)
  }
}
