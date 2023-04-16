const PACKET_LENGTH = 12
const MAX_SLIDER = 300
const ZERO = '0'.codePointAt(0)
const ONE = '1'.codePointAt(0)
async function * packets (port) {
  const reader = port.readable.getReader()
  let buffer = new Uint8Array(PACKET_LENGTH)
  let i = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }
    for (const byte of value) {
      if (byte === ZERO || byte === ONE) {
        buffer[PACKET_LENGTH - 1 - i] = byte === ONE
        i++
        if (i === PACKET_LENGTH) {
          const entry = {
            leftBtn: buffer[0] === 1,
            rightBtn: buffer[1] === 1,
            sliderPressed: buffer[2] === 1,
            sliderPos: 0
          }
          for (let i = 3; i < PACKET_LENGTH; i++) {
            entry.sliderPos |= buffer[i] << (i - 3)
          }
          entry.sliderPos /= MAX_SLIDER
          yield entry
        } else if (i > PACKET_LENGTH) {
          throw new Error('Too many bits??')
        }
      } else if (i !== 0) {
        if (i < PACKET_LENGTH) {
          throw new Error('Bits cut off unexpectedly')
        } else {
          i = 0
        }
      }
    }
  }
  reader.releaseLock()
}

const level = {
  // this is for the type completion
  obstacles: [{ type: 'left', time: 0, element: document.body }]
}
const { obstacles, audio: audioUrl } = await fetch('./level.json').then(r =>
  r.json()
)
level.obstacles = structuredClone(obstacles)
const audio = new Audio(audioUrl)
window.audio = audio

async function reset () {
  for (const obstacle of level.obstacles) {
    obstacle.element?.remove()
  }

  audio.currentTime = 0
  level.obstacles = structuredClone(obstacles)
  for (const obstacle of level.obstacles) {
    if (obstacle.type === 'left' || obstacle.type === 'right') {
      obstacle.element = Object.assign(document.createElement('div'), {
        className: 'square obstacle'
      })
      if (obstacle.type === 'left') {
        leftRow.append(obstacle.element)
      } else {
        rightRow.append(obstacle.element)
      }
    } else {
      obstacle.element = Object.assign(document.createElement('div'), {
        className: `qs ${obstacle.type}`
      })
      wow.append(obstacle.element)
    }
  }
}
document.getElementById('reset').addEventListener('click', reset)

const wow = document.getElementById('wow')
const leftRow = document.getElementById('left-row')
const rightRow = document.getElementById('right-row')
const left = document.getElementById('left')
const right = document.getElementById('right')
const scoreDisplay = document.getElementById('score')
const particleWrapper = document.getElementById('particles')
const statussy = document.getElementById('status')
// again for vs code typing
const wozers = [{ height: 5, elem: document.body }]
wozers.splice(0, 1)
for (let i = 0; i < 20; i++) {
  const elem = Object.assign(document.createElement('div'), {
    className: 'wowzers'
  })
  statussy.append(elem)
  wozers.push({ height: 0, elem })
}

let particles = [
  {
    elem: document.body,
    x: 0,
    y: 0,
    r: 0,
    // rv: 0,
    rTarget: 0,
    angle: 0,
    size: 10,
    border: 1
  }
]
particles = []
function burst (x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const particle = {
      elem: Object.assign(document.createElement('div'), {
        className: 'particle'
      }),
      x,
      y,
      r: 0,
      rv: Math.random() * 2 + 1,
      rTarget: Math.random() * 120 + 20,
      angle: Math.random() * 2 * Math.PI,
      size: Math.random() * 40 + 20,
      border: 1
    }
    Object.assign(particle.elem.style, {
      borderColor: color,
      width: particle.size + 'px',
      height: particle.size + 'px'
    })
    particleWrapper.append(particle.elem)
    particles.push(particle)
  }
}
window.burst = burst

let tilt = 0
let targetTilt = 0
let score = 0

// Based on https://github.com/SheepTester/words-go-here/blob/master/misc/artificial-thonkulos/render-simulation.mjs
const SIM_STEP = 5 // ms per simulation
const MAX_DELAY = 500 // ms
let idealSimTime = 0
let simulatedTime = 0
function simulate () {
  tilt += (targetTilt - tilt) * 0.1
  if (Math.abs(tilt) < Number.EPSILON) {
    tilt = 0
  }
  const W = 3 / 30
  for (const [i, wozer] of wozers.entries()) {
    const targtarg = target
      ? Math.exp(-(((i / (wozers.length - 1) - target.pos) * 4) ** 2)) *
          (1 - W) +
        W
      : W
    if (wozer.height > targtarg) {
      wozer.height += (targtarg - wozer.height) * 0.03
    } else {
      wozer.height = targtarg
    }
  }
  for (const particle of particles) {
    // particle.r += particle.rv
    // if (particle.rv > 0) {
    //   particle.rv -= 0.02
    //   if (particle.rv < 0) particle.rv = 0
    // } else {
    //   particle.rv += 0.02
    //   if (particle.rv > 0) particle.rv = 0
    // }
    particle.r += (particle.rTarget - particle.r) * 0.04
    particle.border += (-0.1 - particle.border) * 0.02
  }
}

function addScore (diff) {
  score += diff
  scoreDisplay.textContent = Math.floor(score)
}

let lastTime = Date.now()
window.animationId = null
let target = null
function paint () {
  const now = Date.now()
  const elapsed = now - lastTime
  if (elapsed < MAX_DELAY) {
    idealSimTime += elapsed
    while (simulatedTime < idealSimTime) {
      simulate()
      simulatedTime += SIM_STEP
    }
  }
  lastTime = now
  wow.style.setProperty('--tilt', `${tilt}deg`)
  const currTime = audio.currentTime
  for (const obstacle of level.obstacles) {
    if (currTime > obstacle.time + 0.3) {
      obstacle.type = 'gone'
      obstacle.element.remove()
      addScore(-30)
    } else if (obstacle.time >= currTime - 2) {
      obstacle.element.style.bottom = `${
        (obstacle.time - currTime) * 500 + 80
      }px`
      obstacle.element.style.display = null
    } else {
      obstacle.element.style.display = 'none'
    }
  }
  level.obstacles = level.obstacles.filter(a => a.type !== 'gone')
  for (const wozer of wozers) {
    wozer.elem.style.height = wozer.height * 30 + 'px'
    wozer.elem.style.opacity = wozer.height / 2 + 0.25
  }
  for (const particle of particles) {
    const borderWidth = (particle.size / 2) * particle.border
    if (borderWidth < 0.5) {
      particle.border = 0
      particle.elem.remove()
    }
    particle.elem.style.left = `${
      particle.x + Math.cos(particle.angle) * particle.r
    }px`
    particle.elem.style.top = `${
      particle.y + Math.sin(particle.angle) * particle.r
    }px`
    particle.elem.style.borderWidth = borderWidth + 'px'
    // particle.elem.style.opacity = 1 - particle.r / particle.rTarget
  }
  particles = particles.filter(a => a.border !== 0)
  window.animationId = window.requestAnimationFrame(paint)
}

const SQ_SIZE = 70
function didItHit (side) {
  const currTime = audio.currentTime
  for (const obstacle of level.obstacles) {
    if (obstacle.type !== side) {
      continue
    }
    const y = (obstacle.time - currTime) * 500
    if (y >= -SQ_SIZE && y < SQ_SIZE) {
      obstacle.element.remove()
      obstacle.type = 'gone'
      addScore(Math.exp(-((y / (SQ_SIZE / 2)) ** 2)) * 100)
      const rect = (side === 'left' ? left : right).getBoundingClientRect()
      burst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        'deepskyblue'
      )
      break
    }
  }
  addScore(-5)
}

async function connect () {
  const port = await navigator.serial.requestPort().catch(() => null)
  if (port === null) {
    return
  }
  document.getElementById('note').remove()
  await port.open({ baudRate: 115200 })
  audio.play()
  let wasLeft = false
  let wasRight = false
  let slideDown = null
  for await (const entry of packets(port)) {
    if (entry.leftBtn) {
      left.classList.add('active')
      if (!wasLeft) {
        didItHit('left')
      }
    } else {
      left.classList.remove('active')
    }
    wasLeft = entry.leftBtn
    if (entry.rightBtn) {
      right.classList.add('active')
      if (!wasRight) {
        didItHit('right')
      }
    } else {
      right.classList.remove('active')
    }
    wasRight = entry.rightBtn
    targetTilt = entry.sliderPressed ? entry.sliderPos * 20 - 10 : 0
    const currTime = audio.currentTime
    if (entry.sliderPressed) {
      if (slideDown === null) {
        slideDown = {
          time: currTime,
          pos: entry.sliderPos
        }
      }
    } else if (slideDown !== null) {
      const diff = entry.sliderPos - slideDown.pos
      const TIME_THRESHOLD = 0.3
      if (Math.abs(diff) > 0.5 && currTime - slideDown.time < 0.2) {
        const dir = diff > 0 ? 'right' : 'left'
        const rect = statussy.getBoundingClientRect()
        burst(
          dir === 'left' ? rect.left : rect.right,
          rect.top + rect.height / 2,
          'rgba(255, 255, 255, 0.8)'
        )
        const midpt = (slideDown.time + currTime) / 2
        for (const obstacle of level.obstacles) {
          if (obstacle.type !== 'qs-' + dir) {
            continue
          }
          if (Math.abs(midpt - currTime) < TIME_THRESHOLD) {
            obstacle.element.remove()
            obstacle.type = 'gone'
            addScore(
              Math.exp(-(((midpt - currTime) / (TIME_THRESHOLD / 2)) ** 2)) *
                300
            )
            break
          }
        }
      }
      slideDown = null
    }
    target = entry.sliderPressed ? { pos: entry.sliderPos } : null
  }
}
document.addEventListener('click', connect, { once: true })

reset()
paint()
