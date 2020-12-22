// good old days!
;
[p1, p2] = document.body.textContent
.trim().split(/\r?\n\r?\n/)
.map(player => player.split(/\r?\n/).slice(1).map(Number))
while (p1.length && p2.length) {
if (p1[0] > p2[0]) {
p1.push(p1.shift(), p2.shift())
} else {
p2.push(p2.shift(), p1.shift())
}
}
winner = p2.length ? p2 : p1
winner.map((card, i) => card * (winner.length - i) ).reduce((a, b) => a + b)

// very recursive :(
;
[p1, p2] = document.body.textContent
.trim().split(/\r?\n\r?\n/)
.map(player => player.split(/\r?\n/).slice(1).map(Number))
memorized = new Map()
function game (p1, p2, tl = false) {
const serr = p1.join('.') + '|' + p2.join('.')
if (memorized.has(serr)) return memorized.get(serr)
const gamHist = new Set()

while (p1.length && p2.length) {
const ser = p1.join('.') + '|' + p2.join('.')
if (gamHist.has(ser)) return (memorized.set(serr, 1), 1)
else gamHist.add(ser)
const p1Card = p1.shift()
const p2Card = p2.shift()
let p1Won
if (p1.length >= p1Card && p2.length >= p2Card) {
v =   game([...p1], [...p2])
//console.log(v)
p1Won = v=== 1
} else p1Won = p1Card > p2Card
if (p1Won) {
p1.push(p1Card, p2Card)
} else {
p2.push(p2Card, p1Card)
}
}
if (tl) {

winner = p2.length ? p2 : p1
console.log(winner.map((card, i) => card * (winner.length - i) ).reduce((a, b) => a + b))
}
if (p2.length) return (memorized.set(serr, 2), 2)
else return (memorized.set(serr, 1), 1)
}
game(p1, p2, true)
