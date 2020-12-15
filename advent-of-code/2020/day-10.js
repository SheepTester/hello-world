// asi angers sometimes
oneJolt = 0
threeJolt = 0
jolt = 0
;document.body.textContent.trim().split(/\r?\n/).map(Number).sort((a, b) => a - b).forEach(j => {
const diff = j - jolt
if (diff === 1) oneJolt++
else if (diff === 3) threeJolt++
else console.error(diff)
jolt = j
})
threeJolt++
;[oneJolt, threeJolt, oneJolt * threeJolt]

// too slow
jolts  = document.body.textContent.trim().split(/\r?\n/).map(Number).sort((a, b) => a - b)
let runs = 0
function arrangements (base, joltages) {
runs++
if (runs > 1000000) throw [base, joltages]
const jumpNext = joltages.filter(n => n - base <= 3)
let count = 0
for (const next of jumpNext) {
count += arrangements(next, joltages.slice(joltages.indexOf(next) + 1))
}
return count || 1
}
arrangements(0, jolts)

// doesn't work
jolts  =
//document.body.textContent.trim()
`28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`
.split(/\r?\n/).map(Number).sort((a, b) => a - b)
jolts.push(Math.max(...jolts) + 3)
end = Math.max(...jolts)
current = 0
let poss = 1
while (current < end) {
const jumpable = jolts.filter(n => n - current <= 3 && n > current)
// how many are in between longest jump?
const inBetween = jumpable.length - 1
const possibilities = { 0: 1, 1: 2, 2: 4 }[inBetween]
if (!possibilities) console.error(inBetween)
poss *= possibilities
current = jumpable[jumpable.length - 1]
}
poss

// count is off
jolts  =
//document.body.textContent.trim()
`28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3`
.split(/\r?\n/).map(Number).sort((a, b) => a - b)
jolts.unshift(0)
function possibleJumpsWithin (slice) {
console.log(slice)
function iter (curr, nextFew) {
const next = nextFew.slice(0, 3).filter(n => n - curr <= 3)
let count = 0
for (const n of next) {
count += iter(n, nextFew.slice(nextFew.indexOf(n) + 1))
}
return count || 1
}
return iter(slice[0], slice.slice(1))
}
lastIndex = 0
poss = 1
for (let i = 0; i < jolts.length; i++) {
const jolt = jolts[i]
if (jolt - jolts[lastIndex] === 3) {
poss *= possibleJumpsWithin(jolts.slice(lastIndex, i + 1))
lastIndex = i
}
}
poss *= possibleJumpsWithin(jolts.slice(lastIndex))

// LOL I compared the WRONG index
jolts  =
document.body.textContent.trim()
.split(/\r?\n/).map(Number).sort((a, b) => a - b)
jolts.unshift(0)
function possibleJumpsWithin (slice) {
console.log(slice)
function iter (curr, nextFew) {
const next = nextFew.slice(0, 3).filter(n => n - curr <= 3)
let count = 0
for (const n of next) {
count += iter(n, nextFew.slice(nextFew.indexOf(n) + 1))
}
return count || 1
}
return iter(slice[0], slice.slice(1))
}
lastIndex = 0
poss = 1
// split by wherever it jumps by 3 because there's only one way to cross a gap of 3
for (let i = 0; i < jolts.length; i++) {
const jolt = jolts[i]
if (jolt - jolts[i - 1] === 3) {
poss *= possibleJumpsWithin(jolts.slice(lastIndex, i + 1))
lastIndex = i
}
}
poss *= possibleJumpsWithin(jolts.slice(lastIndex))
