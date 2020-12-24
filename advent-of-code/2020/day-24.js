// FORGOT TO y--
map = new Set()
;
input = document.body.textContent
.trim().split(/\r?\n/)
.map(tile => {
const neighs = tile.match(/[sn]?[ew]/g)
if (tile.replaceAll(/[sn]?[ew]/g, '')) throw neighs
return neighs
})
for (const neighs of input) {
let x = 0, y = 0 // n is +y
// odd rows offset back (west, left) one
for (const neigh of neighs) {
switch (neigh) {
  case 'e': x++ ;break;
  case 'w': x-- ;break;
  case 'ne': y % 2 === 0 && x++ ; y++;break;
  case 'nw': y % 2 !== 0 &&x-- ; y++;break;
  case 'se': y % 2 === 0 && x++ ; y--;break;
  case 'sw': y % 2 !== 0 &&x-- ; y--;break;
}
}
const id = x + ',' + y
if (map.has(id)) map.delete(id)
else map.add(id)
}
map.size

// OOPS accidentally did now = day(map) lol oof
map = new Set()
;
input = document.body.textContent
.trim().split(/\r?\n/)
.map(tile => {
const neighs = tile.match(/[sn]?[ew]/g)
if (tile.replaceAll(/[sn]?[ew]/g, '')) throw neighs
return neighs
})
neighTypes = ['e', 'w', 'ne', 'nw', 'se', 'sw']
function dir (type, y) {
switch (type) {
  case 'e': return[1, 0] 
  case 'w': return[-1, 0] 
  case 'ne':return[y % 2 === 0 ? 1 : 0, 1] ; y % 2 === 0 && x++ ; y++;break;
  case 'nw':return[y % 2 !== 0 ? -1 : 0, 1] ; y % 2 !== 0 &&x-- ; y++;break;
  case 'se':return[y % 2 === 0 ? 1 : 0, -1] ;y % 2 === 0 && x++ ; y--;break;
  case 'sw': return[y % 2 !== 0 ? -1 : 0,- 1] ;y % 2 !== 0 &&x-- ; ;break;
}
}
for (const neighs of input) {
let x = 0, y = 0 // n is +y
// odd rows offset back (west, left) one
for (const neigh of neighs) {
const [dx, dy] = dir(neigh, y)
x += dx
y += dy
}
const id = x + ',' + y
if (map.has(id)) map.delete(id)
else map.add(id)
}
map.size
function day (board) { // aliv
const process = new Set() // dead
const black =new Set() // ne walive
for (const bl of board) {
const [x, y] = bl .split(',').map(Number)
let nn = 0
for (const nei of neighTypes) {
const [dx, dy ] = dir(nei, y)
const id = (x + dx) + ',' + (y + dy)
if (board.has(id))nn++
else process.add(id)
}
if (nn === 1 || nn === 2) black.add(bl)
}
for (const mm of process) { // dead
const [x, y] = mm .split(',').map(Number)
let nn = 0
for (const nei of neighTypes) {
const [dx, dy ] = dir(nei, y)
const id = (x + dx) + ',' + (y + dy)
if (board.has(id))nn++
}
if ( nn === 2) black.add(mm)
}
return black
}
now = map
for (let i = 100; i--;)
//for (let i = 2; i--;)
now = day(now)
now.size
