/**
 * deno run --allow-net --allow-run --allow-read=./ --allow-write=./thumbnails,./parts,./videos.txt,./output.mp4 audio-to-video.ts
 */

import { serve, ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import { open } from 'https://deno.land/x/opener@v1.0.1/mod.ts'
import { singleArgument } from 'https://deno.land/x/shell_escape@1.0.0/single-argument.ts'

function quoteBash (str: string): string {
  // Single quotes are better? https://superuser.com/a/133787
  // This just flip-flops double and single quotes with JSON.stringify /shrug
  // Also FFMpeg concat only accepts single quotes https://ffmpeg.org/ffmpeg-formats.html#concat
  // > special characters and spaces must be escaped with backslash or single quotes.
  return JSON.stringify(str.replace(/['"]/g, (m: string) => m === '"' ? "'" : '"'))
    .replace(/['"]/g, m => m === '"' ? "'" : '"')
}
function quoteFFMpeg (path: string): string {
  // https://stackoverflow.com/a/49407684
  return singleArgument(path)
  // return path.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

const decoder = new TextDecoder()

interface AudioEntry {
  description: string
  date: Date | 'unknown'
}

const audio: Map<string, AudioEntry> = new Map()
for await (const { isFile, name } of Deno.readDir('./')) {
  if (isFile && (name.endsWith('.mp3') || name.endsWith('.wav'))) {
    const stat = await Deno.stat('./' + name)
    audio.set(name, {
      description: '',
      date: stat.mtime ?? stat.birthtime ?? 'unknown'
    })
  }
}

const thumbnails: Set<string> = new Set()

const server = serve({ hostname: '0.0.0.0', port: 8080 })
await open('http://localhost:8080/')

function useTemplate (html: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <title>Audio to video</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { background-color: black; color: white; font-family: sans-serif; margin: 20px; }
      a { color: cyan; }
      textarea { width: 100%; box-sizing: border-box; }
    </style>
  </head>
  <body>${html}</body>
</html>`
}
function escape (text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function editPage (fileName: string, description: string): string {
  return `<p><a href="/">home</a></p><audio src="/${
    escape(fileName)
  }" controls></audio><form method="POST"><textarea name="desc" autofocus>${
    description
  }</textarea><input type="submit" value="save" /></form>`
}
function sendHtml (request: ServerRequest, html: string, status: number = 200) {
  request.respond({
    status,
    headers: new Headers({
      'Content-Type': 'text/html'
    }),
    body: useTemplate(html)
  })
}
async function sendFile (request: ServerRequest, filePath: string, mimeType: string) {
  request.respond({
    status: 200,
    headers: new Headers({
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
      'Content-Type': mimeType
    }),
    // This seems unsafe but whatever
    // Also, the Atom plugin is outdated and doesn't recognize `| URL` :(
    body: await Deno.readFile(filePath)
  })
}

async function onRequest (request: ServerRequest) {
  const path = decodeURIComponent(request.url)
  if (request.method === 'GET') {
    if (path === '/') {
      sendHtml(request, `<p>This list won't update if you add more audio files. If you restart the server, your work will be lost.</p><ul>${
        Array.from(audio, ([fileName, { description }]) => (
          `<li><a href="/${escape(fileName)}.html">${escape(fileName)}</a> &mdash; ${description ? escape(description).bold() : '<em>No description</em>'}</li>`
        )).join('')
      }</ul><a href="/thumbnails">done</a>`)
    } else if (path === '/thumbnails') {
      sendHtml(request, '<p>wait as the thumbnails are made</p><script src="/thumbnails.exe"></script>')
    } else if (path === '/thumbnails.exe') {
      await sendFile(request, './thumbnail-maker.js', 'application/javascript')
    } else if (path === '/output') {
      await sendFile(request, './output.mp4', 'video/mp4')
    } else if (path === '/data') {
      request.respond({
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify([...audio])
      })
    } else if (path.endsWith('.wav.html') || path.endsWith('.mp3.html')) {
      const fileName = path.slice(1).replace(/\.html$/, '')
      const entry = audio.get(fileName)
      if (entry) {
        sendHtml(request, editPage(fileName, entry.description))
      } else {
        sendHtml(request, '<p>you do not have this sound go <a href="/">home</a></p>', 404)
      }
    } else if (path.endsWith('.wav') || path.endsWith('.mp3')) {
      const fileName = path.slice(1)
      const entry = audio.get(fileName)
      if (entry) {
        await sendFile(request, './' + fileName, path.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg')
      } else {
        sendHtml(request, '<p>you do not have this sound go <a href="/">home</a></p>', 404)
      }
    } else {
      sendHtml(request, '<p>dumb url go <a href="/">home</a></p>', 404)
    }
    return
  } else if (request.method === 'POST') {
    if (path.endsWith('.wav.html') || path.endsWith('.mp3.html')) {
      const fileName = path.slice(1).replace(/\.html$/, '')
      const entry = audio.get(fileName)
      const body = new URLSearchParams(decoder.decode(await Deno.readAll(request.body)))
      if (entry) {
        entry.description = body.get('desc') || ''
        sendHtml(request, editPage(fileName, entry.description))
        return
      }
    } else if (path.endsWith('.wav.png') || path.endsWith('.mp3.png')) {
      const thumbPath = `./thumbnails/${path.slice(1)}`
      await Deno.mkdir('./thumbnails', { recursive: true })
      await Deno.writeFile(thumbPath, await Deno.readAll(request.body))
      thumbnails.add(thumbPath)
      request.respond({ status: 204 })
      return
    } else if (path === '/make-video') {
      console.log('[:)] I\'m starting to make the video...')
      await Deno.mkdir('./parts', { recursive: true })
      // Deno.run({ cmd: ['echo', singleArgument('./thumbnails/test lol!\'.wav.png')] })
      // Deno.run({ cmd: ['wc', '-c', singleArgument('./thumbnails/test lol!\'.wav.png')] })
      const videoPaths: string[] = []
      for (const fileName of audio.keys()) {
        const videoPath = `./parts/${fileName}.mp4`
        const process = Deno.run({
          cmd: [
            'ffmpeg',
            '-loop', '1',
            '-y',
            '-i', `./thumbnails/${fileName}.png`,
            '-i', `./${fileName}`,
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            videoPath
          ]
        })
        const { success } = await process.status()
        if (!success) throw new Error(`Making ${videoPath} was unsuccessful.`)
        console.log(`[:)] - ${videoPath}`)
        videoPaths.push(`file ${quoteFFMpeg(videoPath)}\n`)
      }
      await Deno.writeTextFile('./videos.txt', videoPaths.join(''))
      const process = Deno.run({
        cmd: ['ffmpeg', '-f', 'concat', '-safe', '0', '-i', 'videos.txt', '-c', 'copy', 'output.mp4']
      })
      const { success } = await process.status()
      if (!success) throw new Error(`Merging the video parts was unsuccessful.`)
      console.log('[:)] You are done! You can stop this server by doing ctrl+C.')
      request.respond({ status: 204 })
      return
    }
  }
  sendHtml(request, '<p>method not allowed lmao</p>', 405)
}

for await (const request of server) {
  onRequest(request).catch(err => {
    console.error('[:(] Caught error:', err)
    sendHtml(request, `<p>server die</p><p style="color: pink; white-space: pre-wrap;">${escape(err.toString())}</p>`, 500)
  })
}
