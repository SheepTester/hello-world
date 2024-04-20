// deno run --allow-net --allow-write ucsd-commencement-voices/draw-images.ts

// deno run --allow-net --allow-write --allow-read --allow-env ucsd-commencement-voices/draw-images.ts
// Error: Could not open library: Could not open library: /lib/x86_64-linux-gnu/libc.so.6: version `GLIBC_2.32' not found (required by /home/sheep/.cache/deno/plug/https/github.com/ca5f22309759238252351f9be046c2fe0145354ddfb7f7a85ff783475f26edda.so)
// import { createOgImage } from 'https://raw.githubusercontent.com/Zaubrik/portrait/5efe4252bb526dda4db86e570660be1ef8acb96c/og_image.ts'
import { voices } from './voices.ts'

for (const name of Object.values(voices)) {
  // https://dev.zaubrik.com/og-image/Jimmy_J%20(Conversational).png?theme=Dark&font-size=80px&image=https%3A%2F%2Ffiles.readme.io%2F7e10e8c-small-WSL_Logo_White_1.png&height=60

  const url = `https://dev.zaubrik.com/og-image/${encodeURIComponent(
    name
  )}.png?${new URLSearchParams({
    theme: 'Dark',
    'font-size': '80px',
    image: 'https://files.readme.io/7e10e8c-small-WSL_Logo_White_1.png',
    height: '60'
  })}`
  const response = await fetch(url)
  if (!response.ok) {
    console.error(await response.text())
    throw new Error(`HTTP ${response.status} error`)
  }
  const png = response.body
  if (!png) {
    throw new TypeError('Response body is null')
  }
  // const png = await createOgImage(
  //   new Request(
  //    url
  //   )
  // )
  await Deno.writeFile(`ucsd-commencement-voices/images/${name}.png`, png)
}
