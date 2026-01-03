// node test/add-sheep.mts

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREY = '\x1b[90m'
const RESET = '\x1b[m'

async function * walkDir (dir: string): AsyncGenerator<string> {
  // thanks gemini
  for await (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        continue
      }
      yield * walkDir(path)
    } else if (entry.isFile()) {
      yield path
    }
  }
}

// May require manual intervention:
// - commented out
//   - open-graph-testing
// - script/link inside <title>
//   - dumb
//   - dumb2
// - not actually an html file
//   - fake
// - unclosed <style> tag
//   - heyy
// - inside <noscript>
//   - polyfill

const IGNORE_LIST = [
  'open-graph-testing.html',
  'test/dumb.html',
  'test/dumb2.html',
  'test/fake.html',
  'test/heyy.html',
  'test/polyfill.html'
]

const ALLOWED_ATTRS = ['src', 'type', 'rel', 'href', 'charset']

const plan: Record<string, string> = {}

const removeCrossOriginIntegrity = (str: string) =>
  str
    .replace(/\s*integrity="[^"]+"/, '')
    .replace(/\s*crossorigin(="anonymous")?/, '')
    .replace(/\s*async(="")?/, '')
    .replace(/\s*onload="[^"]+"/, '')
    .replace(/\s*media="screen"/, '')
    .replace(/(\brel=["']?)[a-z-]+(["']?)/, '$1stylesheet$2')

for await (const path of walkDir('.')) {
  if (!/\.html?$/.test(path)) {
    continue
  }

  let html = await readFile(path, 'utf-8')
  const existingSheep = html.match(/\/(sheep[23]?\.js)"/)
  if (existingSheep) {
    console.error(`${GREY}${path} has ${existingSheep[1]}${RESET}`)
    continue
  }

  if (IGNORE_LIST.includes(path)) {
    console.error(`${GREY}${path}: ignored${RESET}`)
  }

  function checkTag (html: string): string {
    const attrs = html
      .trim()
      .replace(/^<script|^<link/, '')
      .replace(/\/?>(\s*<\/script>)?$/, '')
      .trim()
      .split(/\s+/)
    for (const attr of attrs) {
      const index = attr.indexOf('=')
      if (index === -1) {
        console.error(
          `${path}: ${RED}unknown valueless attribute '${attr}'${RESET}`
        )
      } else {
        const key = attr.slice(0, index)
        if (!ALLOWED_ATTRS.includes(key)) {
          console.error(`${path}: ${RED}unknown attribute ${attr}${RESET}`)
        }
      }
    }
    return html
  }

  let cssAdded = false
  let jsAdded = false

  const linkMatch = html.match(
    /([ \t]*<link\s[^>]*href=["'])[^"']*(["'][^>]*\/?>[ \t]*\r?\n?)/
  )
  if (linkMatch) {
    const index = linkMatch.index ?? 0
    html =
      html.slice(0, index) +
      checkTag(
        removeCrossOriginIntegrity(linkMatch[1]) +
          '/sheep3.css' +
          removeCrossOriginIntegrity(linkMatch[2])
      ) +
      html.slice(index)
    cssAdded = true
  }

  const scriptMatch = html.match(
    /([ \t]*<script[^>]*src=["'])[^"']+(["'][^>]*>\s*<\/script\s*>[ \t]*\r?\n?)/
  )
  if (scriptMatch) {
    const index = scriptMatch.index ?? 0
    html =
      html.slice(0, index) +
      checkTag(
        removeCrossOriginIntegrity(scriptMatch[1]) +
          '/sheep3.js' +
          removeCrossOriginIntegrity(scriptMatch[2])
      ) +
      html.slice(index)
    jsAdded = true
  }

  const metaMatch = [
    ...html.matchAll(
      /([ \t]*)<meta[^>]*content=(["'])[^"']*["'][^>]*?(\s*\/?>)([ \t]*\r?\n?)/g
    )
  ].at(-1)
  if (metaMatch) {
    const index = (metaMatch.index ?? 0) + metaMatch[0].length
    html =
      html.slice(0, index) +
      (cssAdded
        ? ''
        : checkTag(
          `${metaMatch[1]}<link rel=${metaMatch[2]}stylesheet${metaMatch[2]} type=${metaMatch[2]}text/css${metaMatch[2]} href=${metaMatch[2]}/sheep3.css${metaMatch[2]}${metaMatch[3]}${metaMatch[4]}`
        )) +
      (jsAdded
        ? ''
        : checkTag(
          `${metaMatch[1]}<script src=${metaMatch[2]}/sheep3.js${metaMatch[2]} charset=${metaMatch[2]}utf-8${metaMatch[2]}></script>${metaMatch[4]}`
        )) +
      html.slice(index)
    cssAdded = true
    jsAdded = true
  }

  const titleMatch = html.match(
    /([ \t]*)<title[^>]*>[^>]*<\/title\s*>([ \t]*\r?\n?)/
  )
  if (titleMatch) {
    const index = (titleMatch.index ?? 0) + titleMatch[0].length
    html =
      html.slice(0, index) +
      (cssAdded
        ? ''
        : checkTag(
          `${titleMatch[1]}<link rel="stylesheet" type="text/css" href="/sheep3.css" />${titleMatch[2]}`
        )) +
      (jsAdded
        ? ''
        : checkTag(
          `${titleMatch[1]}<script src="/sheep3.js" charset="utf-8"></script>${titleMatch[2]}`
        )) +
      html.slice(index)
    cssAdded = true
    jsAdded = true
  }

  if (!cssAdded || !jsAdded) {
    const closeHeadMatch = html.match(/([ \t]*)<\/head>/)
    let fallbackIndex
    let fallbackIndent = ''
    if (closeHeadMatch) {
      fallbackIndex = closeHeadMatch.index ?? 0
      fallbackIndent = closeHeadMatch[1].repeat(2)
      console.error(`${path}: resorting to </head>`)
    } else {
      const closeBodyMatch = html.match(/([ \t]*)<\/body>/)
      if (closeBodyMatch) {
        fallbackIndex = closeBodyMatch.index ?? 0
        fallbackIndent = closeBodyMatch[1].repeat(2)
        console.error(`${path}: resorting to </body>`)
      } else {
        const closeHtmlMatch = html.match(/([ \t]*)<\/html>/)
        if (closeHtmlMatch) {
          fallbackIndex = closeHtmlMatch.index ?? 0
          fallbackIndent = closeHtmlMatch[1].repeat(2)
          console.error(`${path}: resorting to ${YELLOW}</html>${RESET}`)
        } else {
          fallbackIndex = html.length
          console.error(`${path}: resorting to EOF`)
        }
      }
    }
    if (!cssAdded) {
      html =
        html.slice(0, fallbackIndex) +
        fallbackIndent +
        checkTag(
          '<link rel="stylesheet" type="text/css" href="/sheep3.css" />\n'
        ) +
        html.slice(fallbackIndex)
    }
    if (!jsAdded) {
      html =
        html.slice(0, fallbackIndex) +
        fallbackIndent +
        checkTag('<script src="/sheep3.js" charset="utf-8"></script>\n') +
        html.slice(fallbackIndex)
    }
  }

  plan[path] = html
}

for (const [path, html] of Object.entries(plan)) {
  await writeFile(path, html)
}
