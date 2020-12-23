;
[p1, p2] =// document.body.textContent
  `Player 1:
26
16
33
8
5
46
12
47
39
27
50
10
34
20
23
11
43
14
18
1
48
28
31
38
41

Player 2:
45
7
9
4
15
19
49
3
36
25
24
2
21
37
35
44
29
13
32
22
17
30
42
40
6`
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
