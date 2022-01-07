// Part 1: easier than yesterday?
l = document.body.textContent
.trim().split(/,/) // owo v2
.map(Number)
max = Math.max(...l)
min = Math.min(...l)
least = Infinity
for (let i = min; i <= max; i++) {
fuel = l.map(a => Math.abs(a - i)).reduce((a, b) => a + b)
if (fuel < least) least = fuel
}
least

// Part 2: easier than yesterday?? fun fact: i geometrically self derived the formula n * (n + 1) / 2 while looking at squares forming triangles in 8th grade math class, very memorable
l = document.body.textContent
.trim().split(/,/) // owo v2
.map(Number)
max = Math.max(...l)
min = Math.min(...l)
least = Infinity
for (let i = min; i <= max; i++) {
fuel = l.map(a => Math.abs(a - i) * (Math.abs(a - i) + 1) / 2).reduce((a, b) => a + b)
if (fuel < least) least = fuel
}
least
