// Part 1
nums = document.body.textContent.trim().split(/\r?\n/).map(Number)
nums.filter((n, i) => n > nums[i - 1]).length

// Part 2
nums = document.body.textContent.trim().split(/\r?\n/).map(Number)
// a1 + a2 + a3 < a2 + a3 + a4
// a1 < a4
nums.filter((n, i) => n > nums[i - 3]).length
