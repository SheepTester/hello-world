// deceptive strategy in isntr
;
[a, b] = document.body.textContent
// `5764801
// 17807724`
.trim().split(/\r?\n/)
.map(Number)
function transform (secretLoopSize, subjNum = 7) {
let value = 1
for (let i = 0; i < secretLoopSize; i++) {
value *= subjNum
value %= 20201227
}
return value
}
function tAE (pubKey) { // trial and error
for (let i = 1; ; i++) if (transform(i) === pubKey) {
//console.log(i)
return i
}
}
function tae2(pubKey) {
let subjNum = 7
let value = 1
for (let i = 0; ; i++) {
value *= subjNum
value %= 20201227
if (value === pubKey) return i + 1
}
}
//[transform(tAE(a), b), transform(tAE(b), a)]
transform(tae2(a), b)

// LOL part 2
