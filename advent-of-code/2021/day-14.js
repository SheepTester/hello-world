// Part 1
;[template, rules] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v3
template = [...template]
rules=Object.fromEntries(rules.split(/\r?\n/).map(line => {
return line.split(' -> ')
}))
for (let i = 0; i < 10; i++) {
for (let j = 0; j < template.length; j++) {
key = template[j] + template[j + 1]
if (rules[key]) {
template.splice(j + 1, 0, rules[key])
j++
}
}
}
freq = {}
for (const l of template) {
freq[l] ??= 0
freq[l]++
}
f = Object.values(freq).sort((a, b) => a - b)
f.at(-1) - f[0]

// Part 2: hohoho cleverness ensues
;[template, rules] = document.body.textContent
.trim().split(/\r?\n\r?\n/) // owo v3
rules=Object.fromEntries(rules.split(/\r?\n/).map(line => {
return line.split(' -> ')
}))
pairs = {}
for (let i = 0; i < template.length - 1; i++) {
key = template[i] + template[i + 1]
pairs[key] ??= 0
pairs[key]++
}
for (let i = 0; i < 40; i++) {
npairs = {}
for (const [key, count] of Object.entries(pairs)) {
insert = rules[key]
key1 = key[0] + insert
key2 = insert + key[1]
npairs[key1] ??= 0
npairs[key1] += count
npairs[key2] ??= 0
npairs[key2] += count
}
pairs = npairs
}
freq = {}
for (const [key, count] of Object.entries(pairs)) {
freq[key[0]] ??= 0
freq[key[0]] += count
}
freq[template[template.length - 1]] ++
f = Object.values(freq).sort((a, b) => a - b)
f.at(-1) - f[0]
