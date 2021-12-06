const delay = time => new Promise(resolve => setTimeout(resolve, time))
const encoder = new TextEncoder()

await fetch('http://localhost:8080/ok.txt', {
  method: 'POST',
  body: new ReadableStream({
    async start (controller) {
      for (let i = 0; i < 10; i++) {
        await delay(1000)
        controller.enqueue(encoder.encode(`lol #${i}`))
      }
      controller.close()
    }
  })
}).then(r => r.text())

// AH but Chrome does not support this yet :(((
