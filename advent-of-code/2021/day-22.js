// Part 1: unoptimized but whatever
document.documentElement.style.colorScheme = 'dark' // 🥰
;[...lines] = document.body.textContent
  .trim().split(/(?:\r?\n){1}/) // owo v5
  .map(line => {
    const [, to, x1,x2,y1,y2,z1,z2] = line.match(/(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/)
    return { on: to === 'on'
, x: [+x1, +x2]
, y: [+y1, +y2]
, z: [+z1, +z2]}
  })
ons = new Set()
for (const { on, x: [x1,x2], y: [y1,y2], z: [z1,z2] } of lines) {
for (let x = Math.max(x1, -50); x <= Math.min(x2, 50); x++)
for (let y = Math.max(y1, -50); y <= Math.min(y2, 50); y++)
for (let z = Math.max(z1, -50); z <= Math.min(z2, 50); z++) {
if (on) ons.add([x,y,z].join(','))
else ons.delete([x,y,z].join(','))
}
}
ons.size

// Part 2: required THEORY but also forgot they were INCLUSIVE >:(
cubes = document.body.textContent
  .trim().split(/(?:\r?\n){1}/) // owo v5
  .map(line => {
    const [, to, x1,x2,y1,y2,z1,z2] = line.match(/(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/)
    return { on: to === 'on'
, x: [BigInt(x1), BigInt(x2)]
, y: [BigInt(y1), BigInt(y2)]
, z: [BigInt(z1), BigInt(z2)]}
  })
max = (a, b) => a > b ? a : b
min = (a, b) => a < b ? a : b
// volume of intersection, or 0 if no intersection
// [  (   ] ) means my left < other right
// [  ] (  )
// (  [  ] )
// to get volume, take rightmsost left and leftmost right
intersect = (a, b) =>
  a.x[0] <= b.x[1] &&
  b.x[0] <= a.x[1] &&
  a.y[0] <= b.y[1] &&
  b.y[0] <= a.y[1] &&
  a.z[0] <= b.z[1] &&
  b.z[0] <= a.z[1]
  ? { x: [max(a.x[0], b.x[0]), min(a.x[1], b.x[1])]
    , y: [max(a.y[0], b.y[0]), min(a.y[1], b.y[1])]
    , z: [max(a.z[0], b.z[0]), min(a.z[1], b.z[1])] }
  : null
vol = ({ x: [a, b], y: [c, d], z: [e, f] }) => (b-a+1n)*(d-c+1n)*(f-e+1n)

// 123456789
//   ^^^      +3
//     ^^^    +2 (intersection has 1, so +3, -1)
//       ---- -1 (intersects #2 by 1, so only -1)
//     ----   -2 (intersects #1 by 1, #2 by 3, #3 by 2, so -1 -3 +2? no, it's just a coincidence i think. ugh. does it have to keep track of intersections or smth? idk)
//   ==       (result) = 2

// + 3..5
// + 5..7
// - 7..10
// - 5..8

volume = 0n
cubeHist = []
// when they intersect, assuming volume added/removed already
// new x old
// ON x ON -> subtract to avoid double counting
// ON x OFF -> do nothing; it overrides
// OFF x OFF -> add to avoid dbl counting
// OFF x ON -> do nothing; it overrides
// cool
for (let i = 0; i < cubes.length; i++) {
const cube = cubes[i]
const newHist = []
if (cube.on) newHist.push({ ...cube, add: true })
for (let j = 0; j < cubeHist.length; j++) {
const pastCube = cubeHist[j]
const inter = intersect(cube, pastCube)
if (inter) {
    // Undo intersections w/ past cubes
    newHist.push({ ...inter, add: !pastCube.add }) // on = add, else subtrract

// ON -> add entire volume
// ON x ON -> subtract overlap
// OFF x OFF -> add overlap
// OFF -> don't do anything
// OFF x ON -> subtract intersecting area (offed)

// ON x OFF -> add to compensate for subtracted overlap??
}
}
cubeHist.push(...newHist)
}
for (const { add, ...cube } of cubeHist) {
if (add) volume += vol(cube)
else volume -= vol(cube)
//if (volume > Number.MAX_SAFE_INTEGER) throw volume
}
volume
