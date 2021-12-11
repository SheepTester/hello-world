// Part 1: didn't realize it included diagonals 😭
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => Array.from(line, Number))

step = board => {
let flashed = board.map(line => line.map(() => false))
let newboard = board.map(line => line.map(() => false))
let flashes = 0
let flash = (r, c, yes = false) => {
if (flashed[r]?.[c] !== false) return
if (yes) newboard[r][c] += 1
if (newboard[r][c] > 9) {
  flashes++
  newboard[r][c] = 0
  flashed[r][c] = true
  for (let i = 0; i < 9; i++) {
    if (i !== 4) flash(r + i % 3 - 1, c + (i / 3 | 0) - 1, true)
  }
}
}
for (let r = 0; r < board.length; r++) {
for (let c = 0; c < board.length; c++) {
newboard[r][c] = board[r][c] + 1
}
}
for (let r = 0; r < board.length; r++) {
for (let c = 0; c < board.length; c++) {
flash(r, c)
}
}
return { flashes, board: newboard }
}
f = 0
for (let i = 0; i < 100; i++) {
const { flashes, board } = step(l)
l = board
f += flashes
//console.log(l)
}
f

// Part 2: OFF BY ONE. zero-indexed moment >:(
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => Array.from(line, Number))

step = board => {
let flashed = board.map(line => line.map(() => false))
let newboard = board.map(line => line.map(() => false))
let flashes = 0
let flash = (r, c, yes = false) => {
if (flashed[r]?.[c] !== false) return
if (yes) newboard[r][c] += 1
if (newboard[r][c] > 9) {
  flashes++
  newboard[r][c] = 0
  flashed[r][c] = true
  for (let i = 0; i < 9; i++) {
    if (i !== 4) flash(r + i % 3 - 1, c + (i / 3 | 0) - 1, true)
  }
}
}
for (let r = 0; r < board.length; r++) {
for (let c = 0; c < board.length; c++) {
newboard[r][c] = board[r][c] + 1
}
}
for (let r = 0; r < board.length; r++) {
for (let c = 0; c < board.length; c++) {
flash(r, c)
}
}
return { flashes, board: newboard }
}
f = 0
for (let i = 0; i < 1000; i++) {
const { flashes, board } = step(l)
l = board
f += flashes
if (flashes === board.length * board[0].length) {
console.log(i + 1)
break
}
//console.log(l)
}
f
