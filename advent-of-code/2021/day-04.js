// Part 1: grr didn't account for lines starting with spaces
[nums, ...boards] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v2
//.map(Number)
nums = nums.split(',').map(Number)
boards = boards.map(b => b.split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)))
a = [0,1,2,3,4]
for (const n of nums) {
boards = boards.map(b => b.map(line => line.map(i => i === n ? null : i)))
winners = boards.filter(b => {

for (let i = 0; i < 5; i++) {
if (a.every(j => b[i][j] === null)) {
return true
}
if (a.every(j => b[j][i] === null)) {
return true
}
}
})
winner = winners[0]
if (winner ){
console.log(winners, n)
console.log(winner.flatMap(line => line.filter(a => a !== null)))
console.log(eval(winner.flatMap(line => line.filter(a => a !== null)).join('+')) * n)
break
}
}

// Part 2: my logic was bad, found last winner but before it won
[nums, ...boards] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v2
//.map(Number)
nums = nums.split(',').map(Number)
boards = boards.map(b => b.split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)))
a = [0,1,2,3,4]
for (const n of nums) {
boards = boards.map(b => b.map(line => line.map(i => i === n ? null : i)))
oboards = boards.filter(b => {

for (let i = 0; i < 5; i++) {
if (a.every(j => b[i][j] === null)) {
return false
}
if (a.every(j => b[j][i] === null)) {
return false
}
}
return true
})
winner = boards[0]
if (oboards.length == 0 ){
console.log(winner, n)
console.log(winner.flatMap(line => line.filter(a => a !== null)))
console.log(eval(winner.flatMap(line => line.filter(a => a !== null)).join('+')) * n)
break
}
boards = oboards
}
