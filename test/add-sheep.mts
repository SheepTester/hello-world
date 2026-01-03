// node test/add-sheep.mts

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const RED = '\x1b[31m'
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

const plan: Record<string, string> = {}

for await (const path of walkDir('.')) {
  if (!/\.html?$/.test(path)) {
    continue
  }

  let html = await readFile(path, 'utf-8')
  const existingSheep = html.match(/\/(sheep[23]?\.js)"/)
  if (existingSheep) {
    console.log(`${GREY}${path} has ${existingSheep[1]}${RESET}`)
    continue
  }

  let cssAdded = false
  let jsAdded = false

  const linkMatch = html.match(
    /([ \t]*<link\s[^>]*href=["'])[^"']+(["'][^>]*\/?>[ \t]*\r?\n?)/
  )
  if (linkMatch) {
    const index = linkMatch.index ?? 0
    html =
      html.slice(0, index) +
      linkMatch[1] +
      '/sheep3.css' +
      linkMatch[2] +
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
      scriptMatch[1] +
      '/sheep3.js' +
      scriptMatch[2] +
      html.slice(index)
    jsAdded = true
  }

  const metaMatch = [
    ...html.matchAll(
      /([ \t]*)<meta[^>]*content=(["'])[^"']*["'][^>]+(\/?>)([ \t]*\r?\n?)/g
    )
  ].at(-1)
  if (metaMatch) {
    const index = (metaMatch.index ?? 0) + metaMatch[0].length
    html =
      html.slice(0, index) +
      (cssAdded
        ? ''
        : `${metaMatch[1]}<link rel=${metaMatch[2]}stylesheet${metaMatch[2]} type=${metaMatch[2]}text/css${metaMatch[2]} href=${metaMatch[2]}/sheep3.css${metaMatch[2]}${metaMatch[3]}${metaMatch[4]}`) +
      (jsAdded
        ? ''
        : `${metaMatch[1]}<script src=${metaMatch[2]}/sheep3.js${metaMatch[2]} charset=${metaMatch[2]}utf-8${metaMatch[2]}></script>${metaMatch[4]}`) +
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
        : `${titleMatch[1]}<link rel="stylesheet" type="text/css" href="/sheep3.css" />${titleMatch[2]}`) +
      (jsAdded
        ? ''
        : `${titleMatch[1]}<script src="/sheep3.js" charset="utf-8"></script>${titleMatch[2]}`) +
      html.slice(index)
    cssAdded = true
    jsAdded = true
  }

  if (!cssAdded) {
    html += '<link rel="stylesheet" type="text/css" href="/sheep3.css" />\n'
  }
  if (!jsAdded) {
    html += '<script src="/sheep3.js" charset="utf-8"></script>\n'
  }

  plan[path] = html
}

for (const [path, html] of Object.entries(plan)) {
  await writeFile(path, html)
}
