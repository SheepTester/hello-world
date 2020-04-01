import { promises as fs } from 'fs'

async function main () {
  for (const file of await fs.readdir('.')) {
    if (file.endsWith('.mp3') || file.endsWith('.wav')) {
      console.log(file)
    }
  }
}

main()
