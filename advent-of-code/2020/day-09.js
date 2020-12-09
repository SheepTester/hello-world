// was playing mc, uau labels
nums = document.body.textContent.trim().split(/\r?\n/).map(Number)
a:
for (let i = 25; i < nums.length; i++) {
const num = nums[i]
const last = nums.slice(i - 25, i)
for (const n of last) {
if (last.includes(num - n)) continue a
}
throw console.log(num)
}

// apparently not ascending, oops
nums = document.body.textContent.trim().split(/\r?\n/).map(Number)
function invalid () {
a:
for (let i = 25; i < nums.length; i++) {
const num = nums[i]
const last = nums.slice(i - 25, i)
for (const n of last) {
if (last.includes(num - n)) continue a
}
return num
}
}
inv = invalid()
arr = (() => {
b:
for (let i = 0; i < nums.length; i++) {
  for (let j = i + 1; j < nums.length; j++) {
    const sum = nums.slice(i, j).reduce((a, b) => a + b)
    if (sum === inv) return nums.slice(i, j)
     else if (sum > inv) continue
  }
}
})()
Math.min(...arr) + Math.max(...arr)
