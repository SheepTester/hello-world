// Part 1: my passed predicate was faulty :(
;[,minx,maxx,miny,maxy] = document.body.textContent
.trim().match(/target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/).map(Number)
inside = (x,y) => minx <= x && x <= maxx && miny <= y && y <= maxy
passed = (oldx, oldy, newx, newy) => {
// Assumes both points are outside; use minx/y for consistency
return (
// x went accros the region
Math.sign(oldx - minx) !== Math.sign(newx - minx) ||
// or maybe y did
Math.sign(oldy - miny) !== Math.sign(newy - miny)
)
}
// Whether the xv/yv lands
tryy = (xv, yv) => {
x = 0, y = 0,
recordy = 0
step = () => {
x += xv
y += yv
xv -= Math.sign(xv)
yv -= 1
if (y > recordy) recordy = y
}
while (!inside(x, y)) {
step()
if (yv < 0 && y < miny) return 0
}
// Must be inside
return recordy
}


// For my specific case the signs of min/max x/y are the same per axis,
// but could be negative
recordyy = 0
for (let xv = 0; xv < 400; xv ++) {
// Try every xv, yv
for (let yv = 0; yv < 400; yv ++) {
const results = [tryy(xv, yv),
//tryy(xv, -yv),
tryy(-xv, yv),
//tryy(-xv, -yv)
]
recordyy = Math.max(recordyy, ...results)
//if (results.every(test => !test)) break
}
}
recordyy

//tryy(6,9)

// Part 2: just changing the for loop number until it stops changing ¯\_(ツ)_/¯
;[,minx,maxx,miny,maxy] = document.body.textContent
.trim().match(/target area: x=(-?\d+)..(-?\d+), y=(-?\d+)..(-?\d+)/).map(Number)
inside = (x,y) => minx <= x && x <= maxx && miny <= y && y <= maxy
passed = (oldx, oldy, newx, newy) => {
// Assumes both points are outside; use minx/y for consistency
return (
// x went accros the region
Math.sign(oldx - minx) !== Math.sign(newx - minx) ||
// or maybe y did
Math.sign(oldy - miny) !== Math.sign(newy - miny)
)
}
// Whether the xv/yv lands
tryy = (xv, yv) => {
x = 0, y = 0,
recordy = 0
step = () => {
x += xv
y += yv
xv -= Math.sign(xv)
yv -= 1
if (y > recordy) recordy = y
}
while (!inside(x, y)) {
step()
if (yv < 0 && y < miny) return false
}
// Must be inside
return true
}

n = []
// For my specific case the signs of min/max x/y are the same per axis,
// but could be negative
recordyy = 0
for (let xv = 0; xv < 301; xv ++) {
// Try every xv, yv
for (let yv = 0; yv < 301; yv ++) {
if (tryy(xv, yv)) n.push([xv,yv])
if (xv!==0&&tryy(-xv, yv)) n.push([-xv,yv])
if (yv!==0&&tryy(xv, -yv)) n.push([xv,-yv])
if (yv!==0&&xv!==0&&tryy(-xv, -yv)) n.push([-xv,-yv])
}
}
n.length

//tryy(6,9)
