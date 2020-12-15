// forgot to sub 1, 102 rank >:(
s1 = 
document.body.textContent.trim()
.split(/\r?\n/)
.map(line => [...line])
function round (state) {
const get = (x, y) => x < 0 || x >= state[0].length || y <0 || y >= state.length ? '.' : state[y][x]
return state.map((line, y) => line.map((cell, x) => {
if (cell === '.') return '.'
let occ = 0
for (let i = 0; i < 9; i++) if (i !== 4) occ += get(x + i % 3 - 1, y + ((i / 3) | 0) - 1) === '#'
if (cell === 'L') return occ === 0 ? '#' : 'L'
else if (cell === '#') return occ >= 4 ? 'L' : '#'
throw cell
}))
}
round(s1)
do {
last = s1
s1 = round(s1)
console.log(s1.map(a => a.join('')).join('\n'))
} while (JSON.stringify(last) !== JSON.stringify(s1))
JSON.stringify(s1).match(/#/g).length

// had infinite loop because !== '.' not === '.' oops lo
s1 = 
document.body.textContent.trim()
.split(/\r?\n/)
.map(line => [...line])
function round (state) {
const get = (x, y) => x < 0 || x >= state[0].length || y <0 || y >= state.length ? '/' : state[y][x]
const check = (x, y, dx, dy) => {
do {
x += dx
y += dy
}while (get(x, y) === '.')
;
return get(x, y) === '#'
}
return state.map((line, y) => line.map((cell, x) => {
if (cell === '.') return '.'
let occ = 0
for (let i = 0; i < 9; i++) if (i !== 4) occ += check(x, y, i % 3 - 1, ((i / 3) | 0) - 1)
if (cell === 'L') return occ === 0 ? '#' : 'L'
else if (cell === '#') return occ >= 5 ? 'L' : '#'
throw cell
}))
}
round(s1)
do {
last = s1
s1 = round(s1)
//console.log(s1.map(a => a.join('')).join('\n'))
} while (JSON.stringify(last) !== JSON.stringify(s1))
JSON.stringify(s1).match(/#/g).length
