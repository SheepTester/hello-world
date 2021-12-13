// Part 1
;[pts, folds] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v2
pts=pts.split(/\r?\n/).map(pt => {
;[x, y] = pt.split(',').map(Number)
return {x,y}
})
folds=folds.split(/\r?\n/).map(fold => {
;[foldAlong, num] = fold.split('=')
return [foldAlong[foldAlong.length - 1], +num]
})
// minx = Math.min(...pts.map(p => p.x))
// miny = Math.min(...pts.map(p => p.y))
// maxx = Math.max(...pts.map(p => p.x))
// maxy = Math.max(...pts.map(p => p.y))
paper = []
points = new Set()
// fold along x=655
for (const {x,y } of pts) {
  points.add(`${Math.abs(x - 655)},${y}`)
}
console.log(pts.length)
points.size

// Part 2: my coordinate system was wack 😔
;[pts, folds] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v2
pts=pts.split(/\r?\n/)/*.map(pt => {
;[x, y] = pt.split(',').map(Number)
return {x,y}
})*/
folds=folds.split(/\r?\n/).map(fold => {
;[foldAlong, num] = fold.split('=')
return [foldAlong[foldAlong.length - 1], +num]
})
display = pts => {
npts = Array.from(pts, pt => {
;[x, y] = pt.split(',').map(Number)
return {x,y}
})
minx = Math.min(...npts.map(p => p.x))
miny = Math.min(...npts.map(p => p.y))
maxx = Math.max(...npts.map(p => p.x))
maxy = Math.max(...npts.map(p => p.y))
board = []
for (let x = minx; x <= maxx; x++)
for (let y = miny; y <= maxy; y++) {
board[y] ??= []
board[y][x] = pts.has(`${x},${y}`) ? '#' : ' '
}
console.log(board.map(l => l.join('')).join('\n'))
}
//display(new Set(pts))
for (const [dir, pos] of folds) {
points = new Set()
// fold along x=655
npts = Array.from(pts, pt => {
;[x, y] = pt.split(',').map(Number)
return {x,y}
})
minx = Math.min(...npts.map(p => p.x))
miny = Math.min(...npts.map(p => p.y))

for (const pt of pts) {
;[x, y] = pt.split(',').map(Number)
// x-=minx
// y-=miny
  points.add(
  dir === 'x'
  ? `${pos - Math.abs(x - pos)},${y}`
  : `${x},${pos - Math.abs(y - pos)}`
)
}
pts = points
}
display(pts)
