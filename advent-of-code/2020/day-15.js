// directions are hard
turn = 0
lastNum = null
lastTurn = new Map()
times = new Map()
function say (num) {
times.set(num, 1 + (times.get(num) || 0))
if (!lastTurn.has(num))lastTurn.set(num, [])
lastTurn.get(num).unshift(turn)
lastNum = num
}
e = document.body.textContent.trim()
//e = `0,3,6`
for (const n of e.split(',').map(Number)) {
turn++
say(n)
}
function turnn () {
turn++
if (times.get(lastNum) !== 1) {
;[a, b] = lastTurn.get(lastNum)
v = a - b
say(v)
return v
} else {
say(0)
return 0
}
}
while (turn < 2020) {
t = lastNum
v = turnn()
//console.log(turn,
//v
          // ,t )
v
}

// paused before potential out of memory crash oh no
e = document.body.textContent.trim()
e = '0,3,6'
// per turn: number -> last turn BEFORE the prev turn with number
obj = {}
turn = 1
for (const n of e.split(',').map(Number)) {
lastNum = n
obj[lastNum] = turn
turn++
}
console.time()
for (; turn <= 30000000; turn++) {
  const t = obj[lastNum]
  obj[lastNum] = turn - 1
  if (t && t !== turn - 1) {
    lastNum = turn - 1 - t
  } else {
    lastNum = 0
  }
  //console.log(turn, lastNum)
}
console.timeEnd()
lastNum
