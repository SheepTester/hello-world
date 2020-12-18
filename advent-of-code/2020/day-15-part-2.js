//e = document.body.textContent.trim()
// rip node, you're slow
e = [0,12,6,13,20,1,17]
// per turn: number -> last turn BEFORE the prev turn with number
obj = new Map()
turn = 1
for (const n of e) {
lastNum = n
obj.set(lastNum, turn)
turn++
}
console.time()
for (; turn <= 30000000; turn++) {
  const t = obj.get(lastNum)
  obj.set(lastNum, turn - 1)
  if (t && t !== turn - 1) {
    lastNum = turn - 1 - t
  } else {
    lastNum = 0
  }
  //console.log(turn, lastNum)
}
console.timeEnd()
console.log(lastNum)
