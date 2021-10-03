import { ensureDir } from 'https://deno.land/std@0.109.0/fs/ensure_dir.ts'
import { exists } from 'https://deno.land/std@0.109.0/fs/exists.ts'

// $ deno run --allow-all deobf/rs/index.js

const onlyFans = 'ZXB1Yg=='
const base = atob('aHR0cHM6Ly9wbGF0Zm9ybS52aXJkb2NzLmNvbS8=')
const options = {
  headers: {
    Cookie: '...',
    Referer: base
  }
}
const work = '...'

async function get (path) {
  console.log(path)
  const response = await fetch(
    path instanceof URL ? path : new URL(path, base),
    options
  )
  if (response.ok) {
    return response
  } else {
    throw new Error(`HTTP error ${response.status}: ${await response.text()}`)
  }
}

const pagesPath = new URL('./pages/files/pages.json', import.meta.url)
const pages = Array.from(
  (
    await Deno.readTextFile(pagesPath)
      .then(JSON.parse)
      .catch(async () => {
        const json = await get(
          `/api/v2/${onlyFans}page/?limit=400&nav_list__${onlyFans}=${work}&offset=0&order_by=index`
        ).then(r => r.json())
        await Deno.writeTextFile(pagesPath, JSON.stringify(json, null, 2))
        return json
      })
  ).objects
)
const pageNumLength = `${pages.length}`.length

await ensureDir(new URL('./pages/files/', import.meta.url))

const cssPath = new URL('./pages/files/base.css', import.meta.url)
if (!(await exists(cssPath))) {
  await Deno.writeTextFile(
    cssPath,
    await get(atob('L3N0YXRpYy9yZWFkZXIvcnMtY3BsLWJhc2UuY3Nz')).then(r =>
      r.text()
    )
  )
}

for (const [i, { manifestitem }] of pages.entries()) {
  const pageNum = (i + 1).toString().padStart(pageNumLength, '0')
  const rawHtmlPath = new URL(
    `./pages/files/${pageNum}-raw.html`,
    import.meta.url
  )
  const [needFetch, html] = await Deno.readTextFile(rawHtmlPath)
    .then(html => [false, html])
    .catch(async () => [
      true,
      await get('/r/rsspineitem/' + manifestitem.split('/')[4]).then(r =>
        r.text()
      )
    ])
  if (needFetch) {
    await Deno.writeTextFile(
      new URL(`./pages/files/${pageNum}-raw.html`, import.meta.url),
      html
    )
    const buffer = await get(
      new URL(
        html.match(/<img src="(\.\.\/images\/page-\d+\.jpg)"/)[1],
        html.match(/<base href="([^"]+)"\/>/)[1]
      )
    ).then(r => r.arrayBuffer())
    await Deno.writeFile(
      new URL(`./pages/files/${pageNum}.jpg`, import.meta.url),
      new Uint8Array(buffer)
    )
  }
  await Deno.writeTextFile(
    new URL(`./pages/${pageNum}.html`, import.meta.url),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>Page ${i + 1}</title>

    <link rel="stylesheet" href="./files/base.css">
    <style>
      /* From ../css/template.css */

      * { margin: 0; padding: 0; }

      .textLayer {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        line-height: 1.0;
      }

      .textLayer > span {
        color: transparent;
        position: absolute;
        white-space: pre;
        cursor: text;
        transform-origin: 0% 0%;
      }
    </style>
    <style>
      body {
        overflow: auto;
      }
      body img {
        max-width: unset !important;
      }
      .prev,
      .next {
        position: fixed;
        top: 0;
      }
      .prev { left: 0; }
      .next { right: 0; }
    </style>
  </head>
  <body>
    ${html.match(/<div class="textLayer">(.+?)<\/div>/)[0]}
    <img src="./files/${pageNum}.jpg" />
    ${
      i > 0
        ? `<a class="prev" href="./${i
            .toString()
            .padStart(pageNumLength, '0')}.html">&lt;&lt;&lt;</a>`
        : ''
    }${
      i < pages.length - 1
        ? `<a class="next" href="./${(i + 2)
            .toString()
            .padStart(pageNumLength, '0')}.html" autofocus>&gt;&gt;&gt;</a>`
        : ''
    }
  </body>
</html>
`
  )
  if (i > 3) break
}
