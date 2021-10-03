const encoder = new TextEncoder()
let a = 0

setInterval(() => {
  a++
  a %= 20

  Deno.stdout.write(encoder.encode('\r' + '#'.repeat(a) + ' '.repeat(20 - a)))
}, 50)
