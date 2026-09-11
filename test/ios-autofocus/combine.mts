import { readFile, writeFile } from 'fs/promises'

const PREFIX = JSON.parse(
  await readFile(import.meta.resolve('./prefix.json'), 'utf-8')
)
const obj: Record<string, string> = {}

for (let i = 1; i <= 72; i++) {
  const n = i.toString().padStart(2, '0')
  const html = await readFile(`ios-autofocus-${n}.html`, 'utf-8')
  obj[`K${n}`] = html.replace(PREFIX, '{PREFIX}')
}

await writeFile('ios-autofocus/data.json', JSON.stringify(obj, null, 2) + '\n')
