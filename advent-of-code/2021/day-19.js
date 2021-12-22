// Part 1: takes a while to run
;scanners = document.body.textContent
.trim().split(/(?:\r?\n){2}/) // owo v4
.map(scanner => {
;[name, ...coords]=scanner.split(/\r?\n/)
return coords.map(coord => coord.split(',').map(Number))
})

// Maybe could use cross products to filter out flipped orientations? idk lol
// Oh, actually, det([mapping(i) mapping(j) mapping(k)]) will be negative iff orientation flipped -> not a possible rotation
mappings = []
;[0,1,2].map(first => {
const [bb,cc] = [0,1,2].filter(a => a !== first)
for (const [b,c] of [[bb,cc],[cc,bb]]) {
for (let i = 0; i < 8; i++) {
const signA = i & 0b100 ? 1 : -1
const signB = i & 0b010 ? 1 : -1
const signC = i & 0b001 ? 1 : -1
mappings.push(coord => [signA*coord[first],signB*coord[b],signC*coord[c]])
}
}
})

add = ([a,b,c],[d,e,f]) => [a+d,b+e,c+f]
sub = ([a,b,c],[d,e,f]) => [a-d,b-e,c-f].join(',')
// returns offset (b - a), or null if no 12 in common
//   --> such that a + offset = b
// assumes points are unique
// takes two sets of pts (triples of numbers)
getOffset = (a, b) => {
// Get number of times offsets are found
const freq = {}
// Computing all the offsets between all the pts--credit to Timothy
for (const ptA of a)
for (const ptB of b) {
const diff = sub(ptB,ptA)
freq[diff] = (freq[diff] ?? 0) + 1
              }
// duplicate offsets must be unique pairs because points must be unique.
// suppose a1 and b1 have the same offset as a1 and b2. this means b1 = b2. this means the points aren't unique. raa, proof by contradiction
for (const [offset, times] of Object.entries(freq)) {
if (times >= 12) return offset.split(',').map(Number)
}
return null
}

// sort scanned points so it's easy to tell what matches. not significant impact to algorithm
ptSorter = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
scanners[0].sort(ptSorter)

const notInTermsOfScanner0 = new Set(scanners.map((_, i) => i).slice(1))
const used = [0]
for (let i = 0; i < used.length /* add to used as more found */; i++) {
const base = scanners[used[i]]
for (const other of [...notInTermsOfScanner0]) {
for (const mapping of mappings) {
const mapped = scanners[other].map(mapping)
  const offset = getOffset(mapped, base) // so that mapped + offset = base
  if (offset) {
    scanners[other] = mapped.map(r => add(r,offset)).sort(ptSorter)
    notInTermsOfScanner0.delete(other)
    used.push(other)
    break
  }
}
}
// If no offset found, that means scanner OTHER is not in range of scanner BASE. it'll be checked again for the next scanner in USED
}

pts = new Set()
for (const scanner of scanners) {
for (const pt of scanner) pts.add(pt.join(','))
}
pts.size

// Part 2: some modification required, which is fine, though was hoping to just rely on already calcualted values
;scanners = document.body.textContent
.trim().split(/(?:\r?\n){2}/) // owo v4
.map(scanner => {
;[name, ...coords]=scanner.split(/\r?\n/)
return coords.map(coord => coord.split(',').map(Number))
})

// Maybe could use cross products to filter out flipped orientations? idk lol
// Oh, actually, det([mapping(i) mapping(j) mapping(k)]) will be negative iff orientation flipped -> not a possible rotation
mappings = []
;[0,1,2].map(first => {
const [bb,cc] = [0,1,2].filter(a => a !== first)
for (const [b,c] of [[bb,cc],[cc,bb]]) {
for (let i = 0; i < 8; i++) {
const signA = i & 0b100 ? 1 : -1
const signB = i & 0b010 ? 1 : -1
const signC = i & 0b001 ? 1 : -1
mappings.push(coord => [signA*coord[first],signB*coord[b],signC*coord[c]])
}
}
})

add = ([a,b,c],[d,e,f]) => [a+d,b+e,c+f]
sub = ([a,b,c],[d,e,f]) => [a-d,b-e,c-f].join(',')
// returns offset (b - a), or null if no 12 in common
//   --> such that a + offset = b
// assumes points are unique
// takes two sets of pts (triples of numbers)
getOffset = (a, b) => {
// Get number of times offsets are found
const freq = {}
// Computing all the offsets between all the pts--credit to Timothy
for (const ptA of a)
for (const ptB of b) {
const diff = sub(ptB,ptA)
freq[diff] = (freq[diff] ?? 0) + 1
              }
// duplicate offsets must be unique pairs because points must be unique.
// suppose a1 and b1 have the same offset as a1 and b2. this means b1 = b2. this means the points aren't unique. raa, proof by contradiction
for (const [offset, times] of Object.entries(freq)) {
if (times >= 12) return offset.split(',').map(Number)
}
return null
}

// sort scanned points so it's easy to tell what matches. not significant impact to algorithm
ptSorter = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
scanners[0].sort(ptSorter)
scanners[0].position=[0,0,0]

const notInTermsOfScanner0 = new Set(scanners.map((_, i) => i).slice(1))
const used = [0]
for (let i = 0; i < used.length /* add to used as more found */; i++) {
const base = scanners[used[i]]
for (const other of [...notInTermsOfScanner0]) {
for (const mapping of mappings) {
const mapped = scanners[other].map(mapping)
  const offset = getOffset(mapped, base) // so that mapped + offset = base
  if (offset) {
    scanners[other] = mapped.map(r => add(r,offset)).sort(ptSorter)
    scanners[other].position = offset
    notInTermsOfScanner0.delete(other)
    used.push(other)
    break
  }
}
}
// If no offset found, that means scanner OTHER is not in range of scanner BASE. it'll be checked again for the next scanner in USED
}

dist = ([a,b,c],[d,e,f]) => Math.abs(a - d) + Math.abs(b - e) + Math.abs(c - f)
//Math.max(...scanners.flatMap(({ position: a }) => scanners.map(({ position: b }) => dist(a, b))))
max = 0
for (const { position: a } of scanners)
for (const { position: b } of scanners) {
const d = dist(a,b)
if (d > max) max = d
}
max
