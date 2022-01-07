// Part 1: not as bad as it could be
ok = [
2, // one
4, // four
3, // seven
7, // eight
]
r = 0
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => {
;[inp, out] = line.split(' | ')
out = out.split(' ')
r += out.filter(n => ok.includes(n.length)).length
})
r

// Part 2: yikes
ok = {
// length -> digit
2: 1, // one
4: 4, // four
3: 7, // seven
7: 8, // eight
}
keyer = {
// All 6's have ABFG
0: 'abcefg', // 6 - has ce
6: 'abdefg', // 6 - has de
9: 'abcdfg', // 6 - has cd
// All 5's have ADG : 1 E, 1 B
2: 'acdeg', // 5 - has e instead of f
3: 'acdfg', // 5 - has f
5: 'abdfg', // 5 - has b instead of c
1: 'cf',
4: 'bcdf',
7: 'acf',
8: 'abcdefg',
}
r = 0
normalize = word => [...word].sort() // bc there's both "df" and "fd"
letters = [...'abcdefg']
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => {
;[inp, out] = line.split(' | ')
key = {}
inp = inp.split(' ').map(normalize)
out = out.split(' ').map(normalize)
for (const signal of inp) {
if (ok[signal.length]) {
  key[signal] = ok[signal.length]
  key[ok[signal.length]] = signal
}
}
// from CF, ACF, BCDF, and ABCDEFG
// A -   78
// B -  4 8
// C - 1478
// D -  4 8
// E -    8
// F - 1478
// G -    8
a = key[7].filter(a => !key[1].includes(a))[0]
cf = key[1]
bd = key[4].filter(a => !key[1].includes(a))
eg = key[8].filter(a => !key[4].includes(a) && !key[7].includes(a))
long5 = inp.filter(a => a.length === 5)
long6 = inp.filter(a => a.length === 6)
bd0Count = 0, eg0Count = 0
for (const signal of long5) {
if (signal.includes(bd[0])) bd0Count++
if (signal.includes(eg[0])) eg0Count++
}
;[b, d] = bd0Count === 1 ? [bd[0], bd[1]] : [bd[1], bd[0]]
;[e, g] = eg0Count === 1 ? [eg[0], eg[1]] : [eg[1], eg[0]]
r += +out.map(signal => ok[signal.length] || (
  signal.length === 5 ? (signal.includes(e) ? 2 : signal.includes(b) ? 5 : 3) :
  // length 6
  signal.includes(e) ? (signal.includes(d) ? 6 : 0) : 9
)).join('')
})
r
