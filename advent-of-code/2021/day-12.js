// Part 1: forgot the paths are reversible
paths = {}
large = name => name.toUpperCase() === name
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(wow => {
;[from, to] = wow.split('-')
paths[from] ??= []
paths[from].push(to)
paths[to] ??= []
paths[to].push(from)
})
traverse = (start, traversed) => {
if (start == 'end') { //console.log(traversed);
return 1 }
count = 0
for (const path of (paths[start] ?? [])) {
if (large(path) || !traversed.includes(path)) {
count += traverse(path, [...traversed, path])
}
}
return count
}
traverse('start', ['start'])

// Part 2: oops forgot to add a check for start not being duplicatable
paths = {}
large = name => name.toUpperCase() === name
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(wow => {
;[from, to] = wow.split('-')
paths[from] ??= []
paths[from].push(to)
paths[to] ??= []
paths[to].push(from)
})
traverse = (start, traversed, dupe) => {
if (start == 'end') { //console.log(traversed);
return 1 }
count = 0
for (const path of (paths[start] ?? [])) {
let shouldTrav, d = dupe
if (large(path)) shouldTrav = true
else if (traversed.includes(path)) {
  if (dupe || path === 'start') shouldTrav = false
  else {
    shouldTrav = true
    d = true
  }
} else shouldTrav = true
if (shouldTrav) {
count += traverse(path, [...traversed, path], d)
}
}
return count
}
traverse('start', ['start'])
