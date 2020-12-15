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

// 
