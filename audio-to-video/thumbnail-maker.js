const canvas = document.createElement('canvas')
canvas.width = 1920
canvas.height = 1080
document.body.appendChild(canvas)
const c = canvas.getContext('2d')
const radius = Math.hypot(canvas.width, canvas.height) / 2
function makeImage (filename, description, date) {
  const angle = Math.random() * 2 * Math.PI
  const gradient = c.createLinearGradient(
    canvas.width / 2 + Math.cos(angle) * radius,
    canvas.height / 2 + Math.sin(angle) * radius,
    canvas.width / 2 - Math.cos(angle) * radius,
    canvas.height / 2 - Math.sin(angle) * radius
  )
  gradient.addColorStop(0, '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0'))
  gradient.addColorStop(1, '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0'))
  c.fillStyle = gradient
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillStyle = 'white'
  c.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  c.lineWidth = canvas.height * 0.005
  c.font = `${canvas.height * 0.1}px "Montserrat", sans-serif`
  c.strokeText(filename, canvas.width / 2, canvas.height / 3, canvas.width)
  c.fillText(filename, canvas.width / 2, canvas.height / 3, canvas.width)
  c.font = `${canvas.height * 0.05}px "Montserrat", sans-serif`
  c.strokeText(description, canvas.width / 2, 2 * canvas.height / 3, canvas.width)
  c.fillText(description, canvas.width / 2, 2 * canvas.height / 3, canvas.width)
  c.font = `${canvas.height * 0.02}px "Montserrat", sans-serif`
  c.strokeText(date, canvas.width / 2, 2.5 * canvas.height / 3, canvas.width)
  c.fillText(date, canvas.width / 2, 2.5 * canvas.height / 3, canvas.width)
  return new Promise(resolve => canvas.toBlob(resolve))
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main () {
  const audio = await fetch('/data').then(r => r.json())
  for (const [filename, { description, date: dateStr }] of audio) {
    const date = 'Last modified on ' + new Date(dateStr).toString()
    await fetch(`/${filename}.png`, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png'
      },
      body: await makeImage(filename, description, date)
    })
  }
  document.body.prepend('I\'m making the video! See the server console for progress updates.')
  const response = await fetch('/make-video', { method: 'POST' })
  if (response.ok) {
    window.location.replace('/output')
  } else {
    const p = document.createElement('p')
    p.style.color = 'pink'
    p.style.whiteSpace = 'pre-wrap'
    p.textContent = await response.text()
    document.body.prepend('Error :(', p)
  }
}

main()
