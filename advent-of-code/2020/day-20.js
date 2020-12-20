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

