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
corner = null
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
if (sides.find(m => m.dir === 'down') && sides.find(m => m.dir === 'left')) {corner = id;console.log(sides)}
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
// however this cannot be found, so we use the corner where
// one can come DOWN or left. consequences? posiitve Y is up, so
// yes there are BIG consequences. Alternatively, I could, hmm.
// 

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
// map current dir to 90 deg LEFT
right: 'down',
up: 'right',
left: 'up',
down: 'left'
}
function getCell(x, y) {
let dir = 'right'
let currentTile = byId(corner)
let flip = false
while (x >= 8) {
thing = currentTile.sides.find(s => s.dir === rightMappings[dir])
dir = thing.other.dir // dir fortunately means the direction coming IN!
currentTile = byId(thing.other.id)
if (thing.needsFlippin) flip = !flip
x -= 8
}
if (flip) x = 7 - x
flip = false
//console.log(dir, perpMappings[dir])
dir = perpMappings[dir]
while (y >= 8) {
thing = currentTile.sides.find(s => s.dir === rightMappings[dir])
dir = thing.other.dir // dir fortunately means the direction coming IN!
currentTile = byId(thing.other.id)
if (thing.needsFlippin) flip = !flip
y -= 8
}
if (flip) y = 7 - y
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
//findDragonDir(rotators.right)
//getCell(0, 12)
//byId(corner)
//woBorders(input[0].rows)

//[...matchers].filter(f => f[1].length <= 2)

// redoing day 20 because I forgot how my code works
;
function getSides (rows) {
const col = x => rows.map(row => row[x]).join('')
const row = y => rows[y]
// left right top bottom sides, +y down
// clockwise
return [rev(col(0)),col(9),row(0),rev(row(9))] 
}
toId = str => parseInt(str.replace(/#/g, '1').replace(/\./g, '0'), 2)
rev = str => [...str].reverse().join('')
serSide = m => Math.min(toId(m), toId(rev(m))) // "serialize" side
input = document.body.textContent
.trim().split(/\r?\n\r?\n/)
.map(tile => {
  const [header, ...rows] = tile.split(/\r?\n/)
  const id = +header.match(/\d+/)[0]
  const sides = getSides(rows)
  return { id, rows, sides, neighbours: [] }
})
tiles = new Map(input.map(m => [m.id, m]))
function getOtherTilesWithSide (tile) {
  return tile.sides.map(side => {
  const ser = serSide(side)
  const other = [...tiles.values()].find(t => t.id !== tile.id && t.sides.map(serSide).includes(ser))
  if (!other) return null
  // needs flip if the direction for both sides are the SAME. think about it (like gears)
  const needsFlip = other.sides.map(toId).includes(toId(side))
  if (needsFlip) {
  const rows = flip(other.rows)
other. rows = flip(other.rows)
return other
  return {...other, rows,
  sides: null//getSides(rows), 
  }
         }
  else return other
  })
}
function flip (rows) {
 return [...rows].reverse()
}
function rotate90CCW (rows, trim) {
// assumes rows is square (don't think this matters tbh)
  // (4, 1) -> (8, 4)
  // meant to be clockwise but accidentally made ccw, oh well
  return rows.map((row, y) => [...row].map((_, x) => rows[x][rows.length-1-y]).join(''))
}
// map side index to the other
compl = {0:1,1:0,2:3,3:2}
matched = new Set()
pairToId = (a, b) => a.id < b.id ? a.id + ',' + b.id : b.id + ',' + a.id
function rotInPlace (tile) {
  const others = getOtherTilesWithSide(tile)
  tile.neighbours = tile.sides.map((side, i) => {
    if (tile.neighbours[i]) return tile.neighbours[i]
    if (!others[i]) return null
    let rows = others[i].rows
    //let sides = others[i].sides
    for (let j = 0; ; j++ ) {
      if (j > 5) throw {tile,side}
      const sides = getSides(rows)
      // they go in opp dirs (cw and ccw) so must reverse
      if (rev(sides[compl[i]]) === side) {
        matched.add(pairToId(others[i], tile))
        if (others[i].neighbours[compl[i]]) throw 'what'
        others[i].neighbours[compl[i]] = tile.id
        others[i].sides = sides
        others[i].rows = rows
        return others[i].id
        return {...others[i], sides, rows }
      }
      //console.log(rows, sides[compl[i]], side)
      rows = rotate90CCW(rows)
    }
  })
  return tile
}
// left right top bottom
sideData = {0: [-1,0 ],1:[1,0],2:[0,-1],3:[0,1]}
function displ(startTile, trim) {
  const set = new Map()
  let minX = Infinity, maxX = -Infinity,
  minY = Infinity, maxY = -Infinity
  const willProcess = new Set([startTile.id])
  const claims = new Map([[startTile.id, [0, 0]]])
  const next = [[startTile, 0, 0]]
  let item
  while (item = next.shift()) {
  const [{rows,neighbours,id:curr}, dx, dy]=item
  for (let i = 0; i < 4; i++) {
const id = neighbours[i]
if (id ){
const [mdx,mdy] = sideData[i]
if (!willProcess.has(id)) {
willProcess.add(id)
const val=[tiles.get(id), dx+mdx,dy+mdy]
claims.set(id, [dx+mdx,dy+mdy])
next.push(val)
} //else console.log(id, [...willProcess], 'already.')
else {
const claim = claims.get(id)
if (!claim) throw [willProcess, 'has', id, 'but its not in', claims]
const [tx, ty] = claim
if (tx !== dx+mdx || ty !== dy+mdy) {
throw [curr, 'claims', id, 'is at', [dx+mdx,dy+mdy], 'but it is registered at ', [tx, ty]]
}
}
}
  }
const size = trim ? 8 : 10
  const ddx = dx * size
  const ddy = dy * size
  rows.forEach((row, y) => [...row].forEach((cell, x) => {
  let totY = ddy+y,totX = ddx+x
  if (trim) {
if (y === 0 || x === 0 || y === 9 || x === 9) return
totY --
totX--
  }
  if (totY<minY) minY = totY
  if (totX<minX) minX = totX
  if (totY>maxY) maxY = totY
  if (totX>maxX) maxX = totX
  const pos = `${totX},${totY}`
  set.set(pos, cell)
  })
  )
  }
  let str= ''
  for (let y = minY;y<=maxY;y++) {
  for (let x = minX;x<=maxX;x++){
  const pos = `${x},${y}`
  str += set.get(pos) ||' '
  }
  str += '\n'
  }
  return str
}
firstId = input[0].id
//*
done = new Set([])
queue = [firstId]
while (queue.length) {
  const next = queue.shift()
  rotInPlace(tiles.get(next))
  done.add(next)
  for (const neighbour of tiles.get(next).neighbours) {
  if (neighbour!== null && !done.has(neighbour) && !queue.includes(neighbour)) queue.push(neighbour)
  }
  if (queue.length > 17) break
}
wow = displ(tiles.get(firstId), true)
console.log(total = wow.match(/#/g).length)
//console.log(wow) // <--- very cool
wow = wow.trim().split('\n')
orig = [...wow]
dragOk = new Set()
dragon = `                  # 
#    ##    ##    ###
 #  #  #  #  #  #   `.split(/\r?\n/).map((row, y) => [...row].map((char, x) => char === '#' && dragOk.add([x, y])))
d = {width: 19, height: 3}
hasDragons = new Set()
function lookForDragon () {
  for (let x = 0; x < wow[0].length - d.width; x++) {
  lol:
  for (let y = 0; y < wow.length - d.height; y++) {
  for (const [dx, dy] of dragOk) {
  const tdx = x + dx
  const tdy = y + dy
  if (wow[tdy][tdx] === '.') continue lol
  else if (wow[tdy][tdx] !== '#') throw ['?>>???', tdx, tdy]
  }
  console.log('dragon found owo', { x,y })
  for (const [dx, dy] of dragOk) {
  const tdx = x + dx
  const tdy = y + dy
  hasDragons.add(`${tdx},${tdy}`)
  }
  }
  }
}
for (let i = 0; i < 4; i++) {
  console.log(i, 'ok')
  lookForDragon()
  wow = rotate90CCW(wow)
}
wow = flip(wow)
for (let i = 0; i < 4; i++) {
  console.log(i, 'oknt')
  lookForDragon()
  wow = rotate90CCW(wow)
}
//if (orig.join('\n') !== wow.join('\n')) throw 'something badh appened'
null
//*/
// console.log(getOtherTilesWithSide(tiles.get(2663)))
// console.log(rotInPlace(tiles.get(firstId)))
// console.log(getOtherTilesWithSide(tiles.get(2663)))
//getOtherTilesWithSide(tiles[0])
// console.log(tiles[0].rows.join('\n'))
// console.log(rotate90CCW(tiles[0].rows).join('\n'))
total - hasDragons.size
