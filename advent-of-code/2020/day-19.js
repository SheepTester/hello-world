// 102 EEE should've used parens from the start
;
[rawrules, msgs] = document.body.textContent
.trim().split(/\r?\n\r?\n/).map(a => a.split(/\r?\n/))
rules = new Map()
rawrules = new Map(rawrules.map(raw => raw.split(': ')))
function compileRule (id, topLevel) {
if (rules.has(id)) return rules.get(id)
let rule = rawrules.get(id)
if (rule.startsWith('"')) {
rules.set(id, new RegExp(JSON.parse(rule)))
} else {
if (topLevel) rule = '^' + rule.replaceAll('|', '$|^') + '$'
rules.set(id, new RegExp(rule.replace(/\d+/g, id => '('+compileRule(id).toString().replaceAll('/', '') + ')').replace(/\s/g, '')))
}
return rules.get(id)
}
tester = compileRule('0', true)
//tester = new RegExp('^' + compileRule('0').toString().replaceAll('/', '').replaceAll('|', '$|^') + '$')
msgs.filter(t => tester.test(t)).length

// no balancing regex in js
;
[rawrules, msgs] =
document.body.textContent
.trim().split(/\r?\n\r?\n/).map(a => a.split(/\r?\n/))
rules = new Map()
rawrules = new Map(rawrules.map(raw => raw.split(': ')))
rawrules.set('8', '42 | 42 8')
rawrules.set('11', '42 31 | 42 11 31')
parsed = new Set()
get = id => compileRule(id).toString().replaceAll('/', '')
function compileRule (id, topLevel) {
if (rules.has(id)) return rules.get(id)
let rule = rawrules.get(id)
if (rule.startsWith('"')) {
rules.set(id, new RegExp(JSON.parse(rule)))
} else if (id === '8') {
rules.set(id, new RegExp('(?:'+get('42') + '+)'))
} else if (id === '11') {
let str = []
// harcoding up to five /shrug
for (let i =1; i<=5; i++) str.push(
`(?:${get('42')}{${i}})(?:${get('31')}{${i}})`
)
rules.set(id, 
//new RegExp('(?:'+get('42')+'{1})(?:' + get('31') + '+)')
new RegExp(str.join('|')
))
} else {
if (topLevel) rule = '^' + rule.replaceAll('|', '$|^') + '$'
rules.set(id, new RegExp(rule.replace(/\d+/g, id => '(?:'+get(id) + ')').replace(/\s/g, '')))
}
return rules.get(id)
}
glob = id => new RegExp(get(id), 'g')
tester = compileRule('0', true)
//tester = new RegExp('^' + compileRule('0').toString().replaceAll('/', '').replaceAll('|', '$|^') + '$')
msgs.filter(t => tester.test(t)).length
//.map(t => [t.match(glob('42')).length, t.match(glob('31')).length])

// precomputing too powerful, no workie :(
;
[rawrules, msgs] =
document.body.textContent
.trim().split(/\r?\n\r?\n/).map(a => a.split(/\r?\n/))
rawrules = new Map(rawrules.map(raw => raw.split(': ')))
// rawrules.set('8', '42 | 42 8')
// rawrules.set('11', '42 31 | 42 11 31')
precomputed = new Map()
function cross (a, b) {
const res = []
for (const A of a) {
for (const B of b) res.push(A + B)
}
return res
}
function repeat(item, times) {const arr = []
for (let i = times; i--;) arr.push(item)
return arr
}
function precompute (id) {
let rule = precomputed.get(id)
if (!rule) {
let raw = rawrules.get(id)
if (raw.startsWith('"')) rule = [JSON.parse(raw)]
else if (id === '8') {

const f2 = precompute('42')
rule = []
for (let i = 1; i <= 1; i++) {
rule.push(...repeat(f2, i).reduce(cross))
}
}
else if (id === '11') {
const f2 = precompute('42')
const t1 = precompute('31')
rule = []
for (let i = 1; i <= 1; i++) {
rule.push(...cross(
repeat(f2, i).reduce(cross),
repeat(t1, i).reduce(cross)
))
}
}
else {
rule = []
for (const sets of raw.split(' | ')){
rule.push(...sets.split(' ').map(precompute).reduce(cross))
}
}
precomputed.set(rule, id)
}
return rule
}
precompute('0')
//[['a', 'b', 'c'], ['X', 'Y', 'Z'], [1, 2, 3]].reduce(cross)
