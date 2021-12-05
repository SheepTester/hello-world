// Part 1: forgot to consider that x1 might not be smaller than x2
m = {}
l =document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => {
;[a, b] = line.split(' -> ')
;[x1, y1] = a.split(',').map(Number)
;[x2, y2] = b.split(',').map(Number)
if (x2 < x1) [x1, x2] = [x2, x1]
if (y2 < y1) [y1, y2] = [y2, y1]
//console.log(x1, y1, x2, y2)
if (y1 === y2) {
  for (let x = x1; x <= x2 ; x++) {
    const coord = x + '.' + y1
    m[coord] ??= 0
    m[coord] ++
  }
} else if (x1 == x2) {
for (let y = y1; y <= y2 ; y++) {
    const coord = x1 + '.' + y
    m[coord] ??= 0
    m[coord] ++
  }
}

})
c = 0
for (const w of Object.values(m)) {
if (w >= 2) c++
}
c

// Part 2
m = {}
l =document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => {
;[a, b] = line.split(' -> ')
;[x1, y1] = a.split(',').map(Number)
;[x2, y2] = b.split(',').map(Number)
posslope = x1 < x2 && y1 < y2 || x1 > x2 && y1 > y2
if (x2 < x1) [x1, x2] = [x2, x1]
if (y2 < y1) [y1, y2] = [y2, y1]
//console.log(x1, y1, x2, y2)
if (y1 === y2) {
  for (let x = x1; x <= x2 ; x++) {
    const coord = x + '.' + y1
    m[coord] ??= 0
    m[coord] ++
  }
} else if (x1 == x2) {
for (let y = y1; y <= y2 ; y++) {
    const coord = x1 + '.' + y
    m[coord] ??= 0
    m[coord] ++
  }
} else {for (let x = posslope?x1:x2, y = y1; y <= y2 ; x+= (posslope ? 1 : -1),y++) {
    const coord = x + '.' + y
    m[coord] ??= 0
    m[coord] ++
  }
}

})
c = 0
for (const w of Object.values(m)) {
if (w >= 2) c++
}
c
