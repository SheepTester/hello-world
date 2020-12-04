// feel like a better character could be used for the trees
map = document.body.textContent.split(/\r?\n/).filter(a => a)
let x = 0, trees = 0
for (const row of map) {
if (row[x % row.length] === '#') trees++
x += 3
     }
trees

// inelegant because cannot do .map(check); maybe should've destructured
map = document.body.textContent.split(/\r?\n/).filter(a => a)
check = (right, down) => {
let x = 0, trees = 0
for (let r = 0; r < map.length; r += down) {
const row = map[r]
if (row[x % row.length] === '#') trees++
x += right
}
return trees
}
const tests = [
[1, 1],
[3, 1],
[5, 1],
[7, 1],
[1, 2],
].map(a => check(...a))
console.log(tests)
tests.reduce((acc, curr) => acc * curr, 1)
