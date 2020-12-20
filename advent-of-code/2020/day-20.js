// LOL my max - toBin bit flipping method FLOPPED
;
input = document.body.textContent
.trim().split(/\r?\n\r?\n/)
.map(tile => {
const [name, ...rows] = tile.split(/\r?\n/)
const id = +name.match(/\d+/)[0]
return { id, rows }
})
reverse = str => [...str].reverse().join('')
toBin = str => parseInt(str.replace(/\./g, '0').replace(/#/g, '1'),2)
max = toBin('#'.repeat(10)) // 2^10 - 1
function getSides (rows) {
function getCol (x) {
  let str = ''
  for (let i = 0; i < rows.length; i++) str += rows[i][x]
return str
}
function getRow (y) {
  return rows[y]
}
return [
getCol(0), getCol(rows[0].length - 1),
getRow(0), getRow(rows.length - 1)
]
}
serialize = side => Math.min(toBin(side), toBin(reverse(side)))
// side -> tiles
matchers = new Map()
for (const { rows, id } of input) {
for (const side of getSides(rows)){
if (!matchers.has(serialize(side))) matchers.set(serialize(side), [])
//console.log('omg match')
matchers.get(serialize(side)).push(id)
}
}

heat = new Map()
for (const { rows, id } of input) {
// number of edge sides (sides w/ no partners)
let hmm = 0
for (const side of getSides(rows)){
if (matchers.get(serialize(side)).length === 1)hmm++
}
heat.set(hmm, (heat.get(hmm) || 0) + 1)
if (hmm === 2) console.log(id)
}
heat

//[...matchers].filter(f => f[1].length <= 2)

1327
* 3571
* 3391
* 1823

// this is a yikes moment
;
input = document.body.textContent
.trim().split(/\r?\n\r?\n/)
.map(tile => {
const [name, ...rows] = tile.split(/\r?\n/)
const id = +name.match(/\d+/)[0]
return { id, rows, sides: [] }
})
dragon=
`                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `.split(/\r?\n/);
dragonC = [].concat(...dragon.map((a, y) => [...a].map((b, x) => b === '#' && [x, y]).filter(a => a)))
reverse = str => [...str].reverse().join('')
toBin = str => parseInt(str.replace(/\./g, '0').replace(/#/g, '1'),2)
max = toBin('#'.repeat(10)) // 2^10 - 1
function getSides (rows) {
function getCol (x) {
  let str = ''
  for (let i = 0; i < rows.length; i++) str += rows[i][x]
return str
}
function getRow (y) {
  return rows[y]
}
return [
// dir is direction upon BARGING INTO the side
[getCol(0), 'right'],[ getCol(rows[0].length - 1), 'left'],
[getRow(0), 'down'], [getRow(rows.length - 1), 'up']
]
}
serialize = side => Math.min(toBin(side), toBin(reverse(side)))
// side -> tiles
matchers = new Map()
for (const { rows, id } of input) {
for (const [side,dir] of getSides(rows)){
const lized = serialize(side)
if (!matchers.has(lized)) matchers.set(lized, [])
//console.log('omg match')
matchers.get(lized).push({ id, side, lized, dir })
}
}
function woBorders (rows) {
return rows.slice(1, -1).map(a => a.slice(1, -1))
}

heat = new Map()
images = []
byId = id => input.find(f => f.id === id)
for (const obj of input) {
const { rows, id, sides } = obj
// number of edge sides (sides w/ no partners)
let hmm = 0
for (const [side, dir] of getSides(rows)){
const lized = serialize(side)
const arr = matchers.get(lized)
if (arr.length === 1)hmm++
else if (arr.length !== 2) throw ['eee', id]
else {
other = arr[0].id === id ? arr[1] : arr[0]
needsFlippin = other.side !== side
sides.push({ other, needsFlippin, dir })
}
}
if (hmm === 2) {//console.log(sides)
if (sides.find(m => m.dir === 'up') && sides.find(m => m.dir === 'left'))corner = id;
}
obj.newRows = woBorders(rows)
heat.set(hmm, (heat.get(hmm) || 0) + 1)
}
// ideal `corner`: (allows you to come up or left)
//  _______
// |
// |
// |
// |
// corner is ideal so that I can use it as the top left origin lol
if (8 !== input[0].newRows.length) throw 'up'
rightMappings = { // posiitive x dir
// map the current dir to the side to look for (in current thingy)
right: 'left',
left: 'right',
up: 'down',
down: 'up'
}
perpMappings = {
// map current dir to 90 deg right
right: 'down',
up: 'right',
left: 'up',
down: 'left'
}
function getCell(x, y) {
let dir = 'right'
let currentTile = byId(corner)
while (x >= 8) {
thing = currentTile.sides.find(s => s.dir === rightMappings[dir])
dir = thing.other.dir // dir fortunately means the direction coming IN!
currentTile = byId(thing.other.id)
x -= 8
}
//console.log(dir, perpMappings[dir])
dir = perpMappings[dir]
while (y >= 8) {
thing = currentTile.sides.find(s => s.dir === rightMappings[dir])
dir = thing.other.dir // dir fortunately means the direction coming IN!
currentTile = byId(thing.other.id)
y -= 8
}
return {
right: () => currentTile.newRows[y][x],
down: () => currentTile.newRows[x][7 - y],
left: () => currentTile.newRows[7 - y][7 - x],
up: () => currentTile.newRows[7 - x][y]
}[dir]()
console.log(x, y)
return currentTile
}
// 12 tiles wide, so 12 * 8 cells wide. it's a square!
// input.length is 144
boardSize = 12 * 8
dragonWidth = dragon[0].length
dragonHeight = dragon.length
//console.log( { dragonWidth, dragonHeight})
function findDragonAt (baseX, baseY, rotate) {
for (const [dx, dy] of dragonC) {
const [ddx, ddy] = rotate(dx, dy)
if (getCell(baseX + ddx, baseY + ddy) !== '#') return false
}
return true
}
rotators = {
// cw, though does it really matter?
right: (dx, dy) => [dx, dy],
down: (dx, dy) => [-dy, dx],
left: (dx, dy) => [-dx, -dy],
up: (dx, dy) => [dy, -dx]
}
function findDragonDir (rotate) {
for (let x = 0; x < boardSize - dragonWidth; x++) {
for (let y = 0; y < boardSize - dragonWidth; y++) {
if (findDragonAt(x, y, rotate)) console.log('omg')
}
}
}
findDragonDir(rotators.right)
//getCell(95, 94)
//byId(corner)
//woBorders(input[0].rows)

//[...matchers].filter(f => f[1].length <= 2)
