// Group by last digit because they have to add up to multiple of ten :D
sets = {}
document.body.textContent.split('\n').filter(a => a).map(Number).forEach(n => {
const lastDigit = n % 10
sets[lastDigit] ||= new Set()
sets[lastDigit].add(n)
})
for (let i = 1; i < 5; i++) {
  const other = 10 - i
  for (const a of sets[i]) {
    for (const b of sets[other]) {
      if (a + b === 2020) throw [a, b]
    }
  }
}
for (let i of [0, 5]) {
  for (const a of sets[i]) {
    for (const b of sets[i]) {
      if (a + b === 2020) throw [a, b]
    }
  }
}

1573 * 447

// brute force >:D
sets = {}
nums = document.body.textContent.split('\n').filter(a => a).map(Number)
for (const a of nums) {
for (const b of nums) {
for (const c of nums) {
if (a + b + c === 2020) throw [a, b, c]
}
}
}

930 * 609 * 481
