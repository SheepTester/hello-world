const WIDTH = 20

const encoder = new TextEncoder()

export function handleProgress (progress: number): void {
  if (progress === 1) {
    console.log('\r'.padEnd(WIDTH + 10, ' '))
  } else {
    Deno.stdout.write(
      encoder.encode(
        `\r[${'#'.repeat(Math.floor(progress * WIDTH))}${' '.repeat(
          WIDTH - Math.floor(progress * WIDTH)
        )}] ${(progress * 100).toFixed(1).padStart(5, ' ')}%`
      )
    )
  }
}
