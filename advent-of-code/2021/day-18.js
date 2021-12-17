// Part 1: two JS dumbies: ;[p,q] creating globals and inconsistent results oops, and if (a) if (b) else if (c) not the same as if (a) { if (b) } else if (c)
;lines = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(JSON.parse)
isPair = Array.isArray
getFirst = num => isPair(num) ? getFirst(num[0]) : num
getLast = num => isPair(num) ? getLast(num[1]) : num
setFirst = (pair, val) => isPair(pair[0]) ? setFirst(pair[0], val) : (pair[0] = val)
setLast = (pair, val) => isPair(pair[1]) ? setLast(pair[1], val) : (pair[1] = val)
attemptExplode = (pair, parents=[]) => {
const [p,q] = pair
//console.log(pair, parents, isPair(q))
if (parents.length >= 4) {
leftFound = false, rightFound = false
for (let i = parents.length; i--;) {
const { pair: parent, left } = parents[i]
if (left) {
// Try getting right number
if (!rightFound) {
  if (isPair(parent[1])) setFirst(parent[1], getFirst(parent[1]) + q)
  else parent[1] += q
  rightFound = true
}
} else {
if (!leftFound) {
  if (isPair(parent[0])) setLast(parent[0], getLast(parent[0]) + p)
  else parent[0] += p
  leftFound = true
}
}
}
if (parents.at(-1).left) {
parents.at(-1).pair[0] = 0
} else {
parents.at(-1).pair[1] = 0

}
return true
}
return (
isPair(p) && attemptExplode(p, [...parents, { pair, left: true }])
||
isPair(q) && attemptExplode(q, [...parents, { pair, left: false }])
)
}

attemptSplit = pair => {
const [p,q] = pair
if (isPair(p)) {if (attemptSplit(p)) return true}
else if (p >= 10) {
// console.log('ah', pair)
pair[0] = [Math.floor(p / 2), Math.ceil(p / 2)]
return true
}
if (isPair(q)) {if (attemptSplit(q)) return true}
else if (q >= 10) {
pair[1] = [Math.floor(q / 2), Math.ceil(q / 2)]
return true
}
}

reduce = num => {
while (true) {
// console.log(JSON.stringify(num))
if (attemptExplode(num)) continue
if (attemptSplit(num)) continue
break
}
// console.log(JSON.stringify(num))
}

add = (a, b) => {
const sum = [a, b]
reduce(sum)
return sum
}

magnitude = num => isPair(num) ? 3 * magnitude(num[0]) + 2 * magnitude(num[1]) : num

 magnitude(lines.reduce(add))

//reduce((v = [[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]))
// console.log(test(v=[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]))
// JSON.stringify((v))

// Part 2: stupidly cloned sum as argument to reduce rather than before assigning to sum; forgot `reduce` takes reference and not value fdghjbfdg
;lines = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(JSON.parse)
isPair = Array.isArray
getFirst = num => isPair(num) ? getFirst(num[0]) : num
getLast = num => isPair(num) ? getLast(num[1]) : num
setFirst = (pair, val) => isPair(pair[0]) ? setFirst(pair[0], val) : (pair[0] = val)
setLast = (pair, val) => isPair(pair[1]) ? setLast(pair[1], val) : (pair[1] = val)
attemptExplode = (pair, parents=[]) => {
const [p,q] = pair
//console.log(pair, parents, isPair(q))
if (parents.length >= 4) {
leftFound = false, rightFound = false
for (let i = parents.length; i--;) {
const { pair: parent, left } = parents[i]
if (left) {
// Try getting right number
if (!rightFound) {
  if (isPair(parent[1])) setFirst(parent[1], getFirst(parent[1]) + q)
  else parent[1] += q
  rightFound = true
}
} else {
if (!leftFound) {
  if (isPair(parent[0])) setLast(parent[0], getLast(parent[0]) + p)
  else parent[0] += p
  leftFound = true
}
}
}
if (parents.at(-1).left) {
parents.at(-1).pair[0] = 0
} else {
parents.at(-1).pair[1] = 0

}
return true
}
return (
isPair(p) && attemptExplode(p, [...parents, { pair, left: true }])
||
isPair(q) && attemptExplode(q, [...parents, { pair, left: false }])
)
}

attemptSplit = pair => {
const [p,q] = pair
if (isPair(p)) {if (attemptSplit(p)) return true}
else if (p >= 10) {
// console.log('ah', pair)
pair[0] = [Math.floor(p / 2), Math.ceil(p / 2)]
return true
}
if (isPair(q)) {if (attemptSplit(q)) return true}
else if (q >= 10) {
pair[1] = [Math.floor(q / 2), Math.ceil(q / 2)]
return true
}
}

reduce = num => {
while (true) {
// console.log(JSON.stringify(num))
if (attemptExplode(num)) continue
if (attemptSplit(num)) continue
break
}
// console.log(JSON.stringify(num))
}

add = (a, b) => {
const sum = JSON.parse(JSON.stringify([a, b]))
reduce(sum)
return sum
}

magnitude = num => isPair(num) ? 3 * magnitude(num[0]) + 2 * magnitude(num[1]) : num

oldLines = JSON.stringify(lines)
max = 0, maxer = null
for (let i = 0; i < lines.length; i++)
for (let j = 0; j < lines.length; j++) {
if (i === j) continue
mag = magnitude(add(lines[i], lines[j]))
if (mag > max) max = mag, maxer = { i, j }
}
if (JSON.stringify(lines) !== oldLines) throw 'ah'
;({ max, maxer })

//reduce((v = [[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]))
// console.log(test(v=[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]))
// JSON.stringify((v))
