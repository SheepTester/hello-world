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
[rawrules, msgs] = document.body.textContent
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
rules.set(id, new RegExp('('+get('42') + '+)'))
} else if (id === '11') {
rules.set(id, new RegExp('('+get('42')+'+)(' + get('31') + '+)'))
} else {
if (topLevel) rule = '^' + rule.replaceAll('|', '$|^') + '$'
rules.set(id, new RegExp(rule.replace(/\d+/g, id => '('+get(id) + ')').replace(/\s/g, '')))
}
return rules.get(id)
}
tester = compileRule('0', true)
//tester = new RegExp('^' + compileRule('0').toString().replaceAll('/', '').replaceAll('|', '$|^') + '$')
msgs.filter(t => tester.test(t)).length
