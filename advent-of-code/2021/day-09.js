// Part 1: thankful for ?. operator
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(a => Array.from(a, Number))
risk = 0
for (let r = 0; r < l.length; r++) {
for (let c = 0; c < l[r].length; c++) {
if (
(l[r][c-1] ?? Infinity) > l[r][c] &&
(l[r][c+1] ?? Infinity) > l[r][c] &&
(l[r-1]?.[c] ?? Infinity) > l[r][c] &&
(l[r+1]?.[c] ?? Infinity) > l[r][c]
) {
risk += 1 + l[r][c]
}
}
}
risk

// Part 2: omg i placed 63 for 2 stars, amazing. also, chromeos ctrl+shift+u doesn't work too well in devtools rip
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(a => Array.from(a, Number))
risk = 0
checked = l.map(r => r.map(() => false))
sizeOf = (r, c) => {
if (checked[r]?.[c]) return 0
if (checked[r]) checked[r][c] = true
const i = l[r]?.[c]
if (i === 9 || i === undefined) return 0
return (
1 + sizeOf(r - 1, c)
 + sizeOf(r + 1, c)
 + sizeOf(r , c- 1)
 + sizeOf(r , c+ 1)
)
}
sizes=[]
for (let r = 0; r < l.length; r++) {
for (let c = 0; c < l[r].length; c++) {
size = sizeOf(r, c)
if (size > 0) sizes.push(size)
}
}
sizes.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a * b)
