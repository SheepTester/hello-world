// Part 1: Forgot that 0 is still a nonreproductive age
fish = document.body.textContent
.trim().split(/,/) // owo v2
.map(Number)
for (let i = 0; i < 80; i++) {
newfish = []
for (let f of fish) {
f--
if (f < 0) {
f = 6
newfish.push(8)
}
newfish.push(f)
}
fish = newfish
//console.log(fish+'')
}
fish.length

// Part 2: was going to use math then decided not to
mod = (a, b) => (a % b + b) % b
fish = document.body.textContent
.trim().split(/,/) // owo v2
.map(Number)
times = 256
fishinEach = [0,0,0,0, 0,0,0, 0,0,0]
for (const f of fish) fishinEach[f]++
for (let i =0 ; i < times; i++) {
  newfishinEach = [0,0,0,0, 0,0,0, 0,0,0]
  for (const [i, count] of fishinEach.entries()) {
    if (i === 0) {
      newfishinEach[8] += count
    newfishinEach[6] += count
    } else {

    newfishinEach[i - 1] += count
    }
    
  }
fishinEach=newfishinEach
}
fishinEach.reduce((a, b) => a + b)
