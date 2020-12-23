// tfw 3d conways
// anger && where should 've used ||
;
input = document.body.textContent
// input = `.#.
// ..#
// ###`
.trim().split(/\r?\n/)
board = new Set()
function id (x, y, z ) {
  return `${x},${y},${z}`
}
input.forEach((line, y) => {
[...line].forEach((char, x) => {
if (char === '#') board.add(id(x, y, 0))
})})
function round (board) {
const result = new Set() // next alive
const toConsider = new Set() // current dead
for (const cell of board) {
const [mx, my, mz] = cell.split(',').map(Number)
let neighbours = 0
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x !== 0 || y !== 0 || z !== 0) {
const idd = id(mx + x, my + y, mz + z)
if (board.has(idd)) neighbours++
else if (!toConsider.has(idd)) {
toConsider.add(idd)
         }
}
if (neighbours === 2 || neighbours === 3) {
result.add(cell)
}
}
for (const deadCell of toConsider) {
const [mx, my, mz] = deadCell.split(',').map(Number)
let neighbours = 0
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x !== 0 || y !== 0 || z !== 0) {
const idd = id(mx + x, my + y, mz + z)
if (board.has(idd)) neighbours++
}
if (neighbours === 3) {
result.add(deadCell)
}
}
return result
}
  console.log(board)
for (let i = 6; i--;) {
  board = round(board)
  console.log(board)
}
board.size

// easy extension, sad debugging in part i oh wel
;
input = document.body.textContent
// input = `.#.
// ..#
// ###`
.trim().split(/\r?\n/)
board = new Set()
function id (x, y, z ,w) {
  return `${x},${y},${z},${w}`
}
input.forEach((line, y) => {
[...line].forEach((char, x) => {
if (char === '#') board.add(id(x, y, 0, 0))
})})
function round (board) {
const result = new Set() // next alive
const toConsider = new Set() // current dead
for (const cell of board) {
const [mx, my, mz, mw] = cell.split(',').map(Number)
let neighbours = 0
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) for (let w = -1; w <= 1; w++) if (x !== 0 || y !== 0 || z !== 0 || w !== 0) {
const idd = id(mx + x, my + y, mz + z, mw + w)
if (board.has(idd)) neighbours++
else if (!toConsider.has(idd)) {
toConsider.add(idd)
         }
}
if (neighbours === 2 || neighbours === 3) {
result.add(cell)
}
}
for (const deadCell of toConsider) {
const [mx, my, mz, mw] = deadCell.split(',').map(Number)
let neighbours = 0
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) for (let w = -1; w <= 1; w++) if (x !== 0 || y !== 0 || z !== 0 || w !== 0) {
const idd = id(mx + x, my + y, mz + z, mw + w)
if (board.has(idd)) neighbours++
}
if (neighbours === 3) {
result.add(deadCell)
}
}
return result
}
  console.log(board)
for (let i = 6; i--;) {
  board = round(board)
  console.log(board)
}
board.size
