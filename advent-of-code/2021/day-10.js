// Part 1
match = {
'{': '}', '}': '{',
'[': ']', ']': '[',
'<': '>', '>': '<',
'(': ')', ')': '(',
}
closers = {
')': 3,
']': 57,
'}': 1197,
'>': 25137,
}
score = 0
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(line => {
state = []
for (const char of line) {
if (closers[char]) {
// close
const removed = state.shift()
if (removed !== char) {
  score += closers[char]
  return
}
} else {
state.unshift(match[char])
}
}
})
score

// Part 2
match = {
'{': '}', '}': '{',
'[': ']', ']': '[',
'<': '>', '>': '<',
'(': ')', ')': '(',
}
closers = {
')': 1,
']': 2,
'}': 3,
'>': 4,
}
scores = []
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.filter(line => {
state = []
for (const char of line) {
if (closers[char]) {
// close
const removed = state.shift()
if (removed !== char) {
  //score += closers[char]
  return false
}
} else {
state.unshift(match[char])
}
}
let score = 0
for (const wow of state) {
  score *= 5
  score += closers[wow]
}
scores.push(score)
})
scores.sort((a, b) => a - b)
scores[Math.floor(scores.length / 2)]
