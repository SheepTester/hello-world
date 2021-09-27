import { promises as fs } from 'fs'

function minTwo (num) {
  return num.toString().padStart(2, '0')
}

async function main () {
  const json = JSON.parse(await fs.readFile('./db-counter.json', 'utf8'))
  const rows = []
  for (const [key, value] of Object.entries(json)) {
    if (key.startsWith('UGWA_')) {
      const date = new Date(key.replace('UGWA_', '') + '0:00.000Z')
      rows.push([
        [
          [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          ].map(minTwo).join('/'),
          [
            date.getHours(),
            date.getMinutes()
          ].map(minTwo).join(':')
        ].join(' '),
        value.toString()
      ].join('\t'))
    } else {
      console.log(`[Not UGWA_*] ${key}: ${value}`)
    }
  }
  await fs.writeFile('./db-counter.tsv', rows.join('\n'))
}

main()

