import { ensureDir } from 'https://deno.land/std@0.109.0/fs/ensure_dir.ts'
import { exists } from 'https://deno.land/std@0.109.0/fs/exists.ts'

// $ deno run --allow-all deobf/rs/index.js <cookie> <work ID>

const onlyFans = atob('ZXB1Yg==')

const [cookie, work] = Deno.args
const base = atob('aHR0cHM6Ly9wbGF0Zm9ybS52aXJkb2NzLmNvbS8=')
const options = {
  headers: {
    Cookie: cookie,
    Referer: base
  }
}

async function get (path) {
  console.log(path + '')
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

await ensureDir(new URL('./pages/files/', import.meta.url))

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

const cssPath = new URL('./pages/files/base.css', import.meta.url)
if (!(await exists(cssPath))) {
  await Deno.writeTextFile(
    cssPath,
    await get(atob('L3N0YXRpYy9yZWFkZXIvcnMtY3BsLWJhc2UuY3Nz')).then(r =>
      r.text()
    )
  )
}

for (const [i, { manifestitem, label }] of pages.entries()) {
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

    <title>${label}</title>

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
        display: flex;
        overflow: auto;
      }
      body img {
        max-width: unset !important;
      }
    </style>
  </head>
  <body>
    ${html.match(/<div class="textLayer">(.+?)<\/div>/)[0]}
    <img src="./files/${pageNum}.jpg" />
    <script>
      const img = document.querySelector('img')
      img.addEventListener('load', () => {
        window.parent.postMessage({ width: img.width, height: img.height, page: document.title }, '*')
      })
    </script>
  </body>
</html>
`
  )
}

await Deno.writeTextFile(
  new URL('./pages/index.html', import.meta.url),
  (await Deno.readTextFile(new URL('./index.html', import.meta.url)))
    .replace('000.html', `${'1'.padStart(pageNumLength, '0')}.html`)
    .replace('123', pages.length.toString())
)

const outlinePath = new URL('./pages/files/metadata.json', import.meta.url)
const { outline } = await Deno.readTextFile(outlinePath)
  .then(JSON.parse)
  .catch(async () => {
    const metadata = await get(`/api/v2/${onlyFans}/${work}/`).then(r =>
      r.json()
    )
    const { objects: outline } = await get(
      `/api/v2/${atob(
        'bmN4ZW50cnk='
      )}/?${onlyFans}=${work}&limit=400&nav_list=${
        metadata.toc_list.split('/')[4]
      }&offset=0`
    ).then(r => r.json())
    const json = { metadata, outline }
    await Deno.writeTextFile(outlinePath, JSON.stringify(json, null, 2))
    return json
  })

const entries = {}
const topLevel = []
for (const { resource_uri: id, key, label, parent: parentId } of outline) {
  const entry = { label, pageIndex: +key.match(/\d+/)[0], children: [] }
  entries[id] = entry
  if (parentId) {
    entries[parentId].children.push(entry)
  } else {
    topLevel.push(entry)
  }
}
await Deno.writeTextFile(
  new URL('./pages/files/contents.json', import.meta.url),
  JSON.stringify(topLevel, null, 2)
)
