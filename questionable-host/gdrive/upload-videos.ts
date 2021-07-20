// @deno-types='./pako.d.ts'
import { deflate } from 'https://cdn.jsdelivr.net/npm/pako@2.0.3/dist/pako.esm.mjs'
import { handleProgress } from '../handle-progress.ts'
import { upload } from '../upload-download.ts'

const sessionId = (await Deno.readTextFile('../.scratchsessionsid')).trim()

const videos = (await Deno.readTextFile('./videos.txt'))
  .split(/\r?\n/)
  .map(line => line.split('\t'))

const uploaded: Record<string, string> = await Deno.readTextFile(
  './uploaded.json'
).then(JSON.parse)

function displayBytes (bytes: number): string {
  if (bytes > 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(2)} GB`
  } else if (bytes > 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(2)} MB`
  } else if (bytes > 1_000) {
    return `${(bytes / 1_000).toFixed(2)} kB`
  } else if (bytes !== 1) {
    return `${bytes} bytes`
  } else {
    return '1 byte'
  }
}

for (const [index, [fileName, downloadUrl]] of videos.entries()) {
  if (uploaded[fileName]) continue
  console.log(`Downloading ${fileName} from Google Drive`)
  const response = await fetch(downloadUrl)
  let buffer = await response.arrayBuffer()
  const html = await new Blob([buffer]).text()
  // <a id="uc-download-link" class="goog-inline-block jfk-button jfk-button-action" href="/uc?export=download&amp;confirm=bxs9&amp;id=0B7c0K...ONGs">Download anyway</a>
  const match = html.match(/href="(\/uc\?[^"]+)">Download anyway/)
  if (match) {
    // console.log('https://drive.google.com' + match[1].replace(/&amp;/g, '&'))
    console.log(`Downloading ${fileName} from Google Drive (for reals)`)
    buffer = await fetch(
      'https://drive.google.com' + match[1].replace(/&amp;/g, '&'),
      {
        headers: {
          cookie: response.headers.get('set-cookie') || ''
        }
      }
    ).then(r => r.arrayBuffer())
  } else if (html.includes('Sign in to continue to Google Drive')) {
    console.error(
      `${index + 1}. Aiya! Sign in to continue. Shall deal with it later.`
    )
    uploaded[fileName] = '__signin__'
    continue
  }
  console.log(`The file is ${displayBytes(buffer.byteLength)} large.`)
  await Deno.writeFile(
    './temp' + fileName.slice(fileName.lastIndexOf('.')),
    new Uint8Array(buffer)
  )
  const compressed = new Blob([deflate(buffer)])
  console.log(`Compressed to ${displayBytes(compressed.size)}.`)
  // console.log(blob.size)
  const hash = await upload(compressed, sessionId, handleProgress)
  const link = `https://sheeptester.github.io/hello-world/questionable-host/?${new URLSearchParams(
    {
      hash,
      name: fileName,
      compressed: 'true'
    }
  )}`
  console.log(`${index + 1}. ${link}`)
  uploaded[fileName] = link
  await Deno.writeTextFile('./uploaded.json', JSON.stringify(uploaded, null, 2))
}
