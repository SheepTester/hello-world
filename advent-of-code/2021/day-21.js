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

// Part 2: currently gives player 1 win too often
// Flip p 1 and 2 around to see if 1 is being favoured too much
;[, p1, p2] = `Player 1 starting position: 4
Player 2 starting position: 8`//document.body.textContent
.trim().split(/Player 1 starting position: (\d+)\r?\nPlayer 2 starting position: (\d+)/).map(Number)

dice = [1,2,3]
poss =
dice.flatMap(a =>
dice.flatMap(b =>
dice.flatMap(c =>
dice.flatMap(d =>
dice.flatMap(e =>
dice.map(f =>
[a,b,c,d,e,f]
))))))
poss2 = {}
for (const [a1,a2,a3,b1,b2,b3] of poss) {
const id = `${a1+a2+a3},${b1+b2+b3}`
poss2[id] = (poss2[id] ?? 0) + 1
             }
poss2 = Object.entries(poss2).map(([key, val]) => [...key.split(',').map(Number),val])

win1 = 0, win2 = 0
states = {[`${p1},${p2},0,0`]: 1}
while (Object.keys(states).length > 0)
//for (let i = 4; i--;)
 {
console.log(Object.keys(states).length)
freq = {}
for (const [state, times] of Object.entries(states)) {
const [p1, p2, score1, score2] = state.split(',').map(Number)
poss2.forEach(([da,db,tt]) => {
tt *= times
let player1 = (p1 + da - 1) % 10 + 1
let player2 = (p2 + db - 1) % 10 + 1
let s1 = score1 + player1
let s2 = score2 + player2
const newState = `${player1},${player2},${s1},${s2}`
if (s1 < 21 && s2 < 21) {
freq[newState] = tt+(freq[newState] ?? 0)
                    } else {
// EIther:
// P1 and P2 win: P1 won first, before P2 got any points, so P2 must've been < 21 pts to reach this point, so can disregard s2
// P1 only won: P1 wins
// P2 only won: P2 wins
// therefore, shouldn't P1 have priority? and yet P1 is winning too often
if (s1 >= 21) { 
//if (s2 < 21 ) 
  win1 += tt 
}
else /*if (s2 > s1)*/ 
//if (s2 >= 21)
  win2  += tt
//else throw 'what'
}
})
}
states = freq
}
console.log(win1,win2)
Math.max(win1,win2)
