// Part 1
[t, d] = document.body.textContent.split('\n')
ts = t.split(/\s+/).slice(1).map(Number)
ds = d.split(/\s+/).slice(1).map(Number)
races = ts.map((t, i) => {
  d = ds[i]
  ways = 0
  for (let i = 0; i <= t; i++) {
    const speed = i
    const dist = (t - i) * speed
    if (dist > d) ways ++
  }
  return ways
}).reduce((a, b) => a * b)

// Part 2
[t, d] = document.body.textContent.split('\n')
t = +t.replace('Time:', '').replace(/\s+/g,'')
d =+d.replace('Distance:', '').replace(/\s+/g,'')
  ways = 0
  for (let i = 0; i <= t; i++) {
    const speed = i
    const dist = (t - i) * speed
    if (dist > d) ways ++
  }
ways
