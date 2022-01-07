// Part 1
;[, p1, p2] = document.body.textContent
.trim().split(/Player 1 starting position: (\d+)\r?\nPlayer 2 starting position: (\d+)/).map(Number)

die = 0
roll = () => ++die

score1 = 0, score2 = 0
while (score1 < 1000 && score2 < 1000) {
p1 += roll() + roll() + roll()
p1 = (p1 - 1) % 10 + 1
score1 += p1
p2 += roll() + roll() + roll()
p2 = (p2 - 1) % 10 + 1
score2 += p2
}
Math.min(score1, score2) * die

// Part 2: accidentally forked universes even when p1 already won
// Flip p 1 and 2 around to see if 1 is being favoured too much
;[, p1, p2] = document.body.textContent
.trim().split(/Player 1 starting position: (\d+)\r?\nPlayer 2 starting position: (\d+)/).map(Number)

dice = [1,2,3]
poss =
dice.flatMap(a =>
dice.flatMap(b =>
dice.map(f =>
[a,b,f]
)))
poss2 = {}
for (const [a1,a2,a3] of poss) {
const id = a1+a2+a3//},${b1+b2+b3}`
poss2[id] = (poss2[id] ?? 0) + 1
             }
poss2 = Object.entries(poss2).map(([key, val]) => [+key,val])

win1 = 0, win2 = 0
states = {[`${p1},${p2},0,0`]: 1}
p1turn = true
while (Object.keys(states).length > 0)
//for (let i = 4; i--;)
 {
console.log(Object.keys(states).length)
freq = {}
for (const [state, times] of Object.entries(states)) {
const [p1, p2, score1, score2] = state.split(',').map(Number)
poss2.forEach(([da,tt]) => {
tt *= times
let player = ((p1turn ? p1 : p2) + da - 1) % 10 + 1
let ns = (p1turn ? score1 : score2) + player
const newState = p1turn
? `${player},${p2},${ns},${score2}`
: `${p1},${player},${score1},${ns}`
if (ns < 21) {
freq[newState] = tt+(freq[newState] ?? 0)
                    } else {
if (p1turn) win1 += tt
else win2 += tt
}})
}
states = freq
p1turn = !p1turn
}
console.log(win1,win2)
Math.max(win1,win2)
