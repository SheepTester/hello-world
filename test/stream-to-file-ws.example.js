const delay = time => new Promise(resolve => setTimeout(resolve, time))
const ws = new WebSocket('ws://localhost:8080/ok.txt')
await new Promise(resolve => (ws.onopen = resolve))
for (let i = 0; i < 10; i++) {
  await delay(300)
  ws.send(`lol #${i}\n`)
}
ws.close()
