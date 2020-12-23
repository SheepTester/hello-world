;
input = [...'418976235'
//document.body.textContent
//'389125467'
.trim()
].map(Number)
cup = 0
maxCup = Math.max(...input)
minCup = Math.min(...input)
for (let i = maxCup + 1; i <= 1000000; i++ ) input.push(i)
maxCup = 1000000
function move () {
const pickUp = input.splice(cup + 1, 3)
let destCup = input[cup] - 1
while (pickUp.includes(destCup)) {
destCup--
if (destCup < minCup) destCup = maxCup
}
const destIndex = input.indexOf(destCup)
// move curr cup to front
//input = [...input.slice(0, destIndex + 1), ...pickUp, ...input.slice(destIndex + 1)]
input.splice(destIndex + 1, 0, ...pickUp)
cup++
}
for (let i = 0; i < 10000000; i++) {
  move()
  if (i % 1e5 === 0) console.log(i)
//move()
}
oneInd = input.indexOf(1)
;[a, b]=input.slice(oneInd + 1, oneInd + 3)
a * b
//move()
//input.join('')
