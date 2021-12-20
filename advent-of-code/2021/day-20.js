// Part 1: I think the instructions have a typo, and also it's annoying how my input algorithm starts with a #
;[alg, inp] = document.body.textContent
.trim().split(/(?:\r?\n){2}/) // owo v4
inp = inp.split(/(?:\r?\n){1}/)
bounds = {
r: [0, inp.length-1],
c: [0, inp[0].length-1],
}
lit = {}
for (const [r,row] of inp.entries()) {
Array.from(row, (px, c) => {
if (px === '#') lit[`${r},${c}`] = true
})
}

const get = (m,r, c) => {
const { bounds, lit, def } = m
if (r < bounds.r[0] || r > bounds.r[1]) return def
if (c < bounds.c[0] || c > bounds.c[1]) return def
return lit[`${r},${c}`]
}
enhance = (m) => {
const { bounds, lit, def } = m
const newLit = {}
for (let r = bounds.r[0]-1; r <= bounds.r[1]+1; r++)
for (let c = bounds.c[0]-1; c <= bounds.c[1]+1; c++) {
let entry = 0
for (let i = 0; i < 9; i++) {
if (get(m,r + (Math.floor(i / 3) - 1), c + (i % 3 - 1))) {
entry |= 1 << (8 - i)
}
}
if (alg[entry] === '#') newLit[`${r},${c}`] = true
}
return {
bounds: { 
r: [bounds.r[0] - 1, bounds.r[1] + 1],
c: [bounds.c[0] - 1, bounds.c[1] + 1],
 },
lit: newLit,
def: def ?alg[512] === '#' : alg[0] === '#'
}
}

draw = (m) => {
const { bounds, lit, def } = m
let out = ''
for (let r = bounds.r[0]; r <= bounds.r[1]; r++) {
for (let c = bounds.c[0]; c <= bounds.c[1]; c++) {
out += get(m,r,c) ? '#' : '.'
}
out += '\n'
}
out += `All else ${def ? '#' : '.'}; ${Object.keys(lit).length} lit`
return out
}

// console.log(draw({ bounds, lit, def: false }))
// console.log(draw(enhance({ bounds, lit, def: false })))
// console.log(draw(enhance(enhance({ bounds, lit, def: false }))))

//enhance({ bounds, lit, def: false })
;Object.keys(enhance(enhance({ bounds, lit, def: false })).lit).length

// Part 2
;[alg, inp] = document.body.textContent
.trim().split(/(?:\r?\n){2}/) // owo v4
inp = inp.split(/(?:\r?\n){1}/)
bounds = {
r: [0, inp.length-1],
c: [0, inp[0].length-1],
}
lit = {}
for (const [r,row] of inp.entries()) {
Array.from(row, (px, c) => {
if (px === '#') lit[`${r},${c}`] = true
})
}

const get = (m,r, c) => {
const { bounds, lit, def } = m
if (r < bounds.r[0] || r > bounds.r[1]) return def
if (c < bounds.c[0] || c > bounds.c[1]) return def
return lit[`${r},${c}`]
}
enhance = (m) => {
const { bounds, lit, def } = m
const newLit = {}
for (let r = bounds.r[0]-1; r <= bounds.r[1]+1; r++)
for (let c = bounds.c[0]-1; c <= bounds.c[1]+1; c++) {
let entry = 0
for (let i = 0; i < 9; i++) {
if (get(m,r + (Math.floor(i / 3) - 1), c + (i % 3 - 1))) {
entry |= 1 << (8 - i)
}
}
if (alg[entry] === '#') newLit[`${r},${c}`] = true
}
return {
bounds: { 
r: [bounds.r[0] - 1, bounds.r[1] + 1],
c: [bounds.c[0] - 1, bounds.c[1] + 1],
 },
lit: newLit,
def: def ?alg[512] === '#' : alg[0] === '#'
}
}

draw = (m) => {
const { bounds, lit, def } = m
let out = ''
for (let r = bounds.r[0]; r <= bounds.r[1]; r++) {
for (let c = bounds.c[0]; c <= bounds.c[1]; c++) {
out += get(m,r,c) ? '#' : '.'
}
out += '\n'
}
out += `All else ${def ? '#' : '.'}; ${Object.keys(lit).length} lit`
return out
}

// console.log(draw({ bounds, lit, def: false }))
// console.log(draw(enhance({ bounds, lit, def: false })))
// console.log(draw(enhance(enhance({ bounds, lit, def: false }))))
t = { bounds, lit, def: false }
for (let i = 50; i--;) t = enhance(t)
//enhance({ bounds, lit, def: false })
;Object.keys(t.lit).length
