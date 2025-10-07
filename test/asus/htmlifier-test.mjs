import fs from 'fs/promises'
import Htmlifier from '@sheeptester/htmlifier'

async function main () {
  const html = await new Htmlifier()
    .htmlify({ type: 'id', id: '276660763' })
    .then(blob => blob.text())
  await fs.writeFile('./index.html', html)
}

main()
