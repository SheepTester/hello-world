import { emptyDir } from 'https://deno.land/std@0.97.0/fs/empty_dir.ts'
import { ensureFile } from 'https://deno.land/std@0.97.0/fs/ensure_file.ts'

// From https://github.com/nbuilding/N-lang/blob/22f8a361d141c2e034c732e836f5eb81b57fa935/js/src/utils/type-guards.ts#L23
function isObjectLike (
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString (value: unknown): value is string {
  return typeof value === 'string'
}

function getSourceMap (json: unknown): Map<string, string> {
  if (!isObjectLike(json)) {
    throw new TypeError('JSON is not an object')
  }
  const { sources, sourcesContent } = json
  if (!Array.isArray(sources) || !sources.every(isString)) {
    throw new TypeError('`sources` is not a string[]')
  }
  if (!Array.isArray(sourcesContent) || !sourcesContent.every(isString)) {
    throw new TypeError('`sourcesContent` is not a string[]')
  }
  if (sources.length !== sourcesContent.length) {
    throw new RangeError('`sources` and `sourcesContent` are not of the same length')
  }
  const map = new Map()
  sources.forEach((sourceUri, i) => {
    map.set(sourceUri, sourcesContent[i])
  })
  return map
}

async function getSourceMapsFrom (url: string): Promise<Map<string, string>> {
  const html = await fetch(url)
    .then(r => r.text())

  const sourceMapUrls = [...html.matchAll(/src="(\/.+?\.js)/g)]
    .map(([, jsUrl]) => {
      return new URL(jsUrl + '.map', url)
    })

  const responses = await Promise.all(
    sourceMapUrls
      .map(url => fetch(url)
        .then(r => r.json())
        .then(getSourceMap)
        .catch(() => null))
  )

  const superMap = new Map()

  for (const map of responses) {
    if (!map) continue
    for (const [rawUri, content] of map) {
      let uri = rawUri
      if (rawUri.includes('?')) {
        const searchIndex = rawUri.indexOf('?')
        uri = rawUri.slice(0, searchIndex)
        const dotIndex = uri.indexOf('.', uri.lastIndexOf('/'))
        const search = rawUri.slice(searchIndex + 1)
        uri = dotIndex === -1
          ? uri + '__' + search
          : uri.slice(0, dotIndex) + '__' + search + uri.slice(dotIndex)
      }
      if (superMap.has(uri)) {
        console.warn('Duplicate URI', uri)
      }
      superMap.set(uri, content)
    }
  }

  return superMap
}

await emptyDir('source')
for (const [uri, content] of await getSourceMapsFrom('https://electron.stp-prod.collegeboard.org/')) {
  let path = uri.startsWith('webpack:////')
    ? uri.replace('webpack:////', './source/src/')
    : uri.startsWith('webpack:///./')
    ? uri.replace('webpack:///./', './source/src/')
    : uri.startsWith('webpack:///../')
    ? uri.replace('webpack:///../', './source/')
    : uri.startsWith('webpack:///(webpack)/')
    ? uri.replace('webpack:///(webpack)/', './source/.webpack/')
    : uri.startsWith('webpack:///webpack/')
    ? uri.replace('webpack:///webpack/', './source/.webpack/')
    : null
  if (path === null) {
    console.warn(uri, 'doesn\'t start with webpack://')
    continue
  }
  if (path.includes('..')) {
    console.warn(uri, 'has two .., it seems')
    continue
  }
  if (path.includes(String.raw`^\.\/.*$`)) {
    path = path.replace(String.raw`^\.\/.*$`, '')
  }
  await ensureFile(path).catch(err => {
    console.log(path)
    throw err
  })
  await Deno.writeTextFile(path, content)
}
