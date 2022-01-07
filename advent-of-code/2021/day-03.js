// Part 1
g = [], e = []
l = document.body.textContent.trim().split(/\r?\n/) // owo
.map(b => b.split(''))
for (let i = 0; i < '010111111011'.length; i++) {
ones = 0, zeros = 0
for (const bits of l) {
if (bits[i] == '0') zeros++
else ones++
}
if (ones > zeros) {
g[i] = '1'
e[i] = '0'}else{
e[i] = '1'
g[i] = '0'}
}
parseInt(g.join(''), 2) * parseInt(e.join(''), 2)

// Part 2: I didn't notice that it said to stop when there's one number left. Oops
l =  document.body.textContent
.trim().split(/\r?\n/) // owo
.map(b => b.split('')) 
function m (l, useLeast = false) {
for (let i = 0; i < '010111111011'.length; i++) {
  ones = 0, zeros = 0
  for (const bits of l) {
  if (bits[i] == '0') zeros++
  else ones++
  }
  keepOnes = useLeast ? ones < zeros : ones >= zeros
  //dir(keepOnes)
  if (keepOnes) {
  l = l.filter(b => b[i] === '1')
  }else{
  l = l.filter(b => b[i] === '0')
  }
  if (l.length <= 1) break
  //console.log(l)
}
//console.log(l)
return parseInt(l[0].join(''), 2)
}
m(l, false) * m(l, true)
//parseInt(g.join(''), 2) * parseInt(e.join(''), 2)
