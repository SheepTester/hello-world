// imagine parsing it yourself
;
function evall (expr) {
let n = Array.isArray(expr[0]) ? evall(expr[0]) : +expr[0]
for (let i = 1; i < expr.length; i+=2) {
const op = expr[i]
const val = Array.isArray(expr[i + 1]) ? evall(expr[i + 1]) : +expr[i + 1]
if (op === '*') n *= val
else if (op === '+') n += val
else throw op
}
if (Number.isNaN(n)) throw expr
return n
}
input = document.body.textContent
.trim().split(/\r?\n/)
.map(line => {
const parts = line.replaceAll('(', '[').replaceAll(')', ']').replaceAll(' ', ', ').replace(/\d+|[+*]/g, m => `"${m}"`)
const out =JSON.parse (`[${parts}]`)
return evall(out)
}).reduce((a, b) => a + b)

// EVAL time
;
function ok (...unms) {
return unms.filter(a => a).reduce((a, b) => a * b)
}
input = document.body.textContent
.trim().split(/\r?\n/)
.map(line => {
const parts = line.replaceAll('(', 'ok(').replaceAll('*', ', null, ')
//const out =JSON.parse (`[${parts}]`)
return eval(`ok(${parts})`)
return evall(out)
}).reduce((a, b) => a + b)
