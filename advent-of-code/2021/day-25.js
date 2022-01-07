// Part 1: Forgot to transfer non-movers to `newcums`
document.documentElement.style.colorScheme = 'dark' // 🥰
lines = document.body.textContent
  .trim().split(/(?:\r?\n){1}/) // owo v5
cums = {}
rows = lines.length
cols = lines[0].length
for (const [r, line] of lines.entries()) {
Array.from(line, (cum, c) => {
if (cum !== '.') cums[`${r},${c}`] = cum
})
}

step = (cums, east) => {
newcums = {}
for (const [pos, dir] of Object.entries(cums)) {
if (east ? dir === '>' : dir === 'v') {
const [r, c] = pos.split(',').map(Number)
const target = (east ? [r,(c+1)%cols] : [(r+1)%rows,c]).join(',')
if (!cums[target]) {
newcums[target] = dir
} else {
newcums[pos] = dir
}
} else {
newcums[pos] = dir
}
}
return newcums
}

s = 0
oldcums = null
while (oldcums !== JSON.stringify(cums)) {
s++
oldcums = JSON.stringify(cums)
cums = step(cums, true)
cums = step(cums, false)
}
s
