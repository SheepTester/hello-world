// uwu js speed
m = ['byr',
'iyr',
'eyr',
'hgt',
'hcl',
'ecl',
'pid',]
//'cid',]
document.body.textContent.split(/\r?\n\r?\n/).filter(a => a).filter(d => {
for (const t of m) if (!d.includes(t + ':')) return false
return true
}).length

// mysterious anger bug
m = ['byr',
'iyr',
'eyr',
'hgt',
'hcl',
'ecl',
'pid',]
a = document.body.textContent.split(/\r?\n\r?\n/).filter(a => a).map(d => {
try {
for (const t of m) if (!d.includes(t + ':')) throw 'mising ' + t
mat = d.match(/byr:(\d{4})/)
if (!mat) throw '!! no  valid byr'
if (1920 > +mat[1] || +mat[1] > 2002) throw 'byr out of range' + mat[1]
mat = d.match(/iyr:(\d{4})/)
if (!mat) throw '!!no  valid iyr'
if (2010 > +mat[1] || +mat[1] > 2020) throw 'iyr out' + mat[1]
mat = d.match(/eyr:(\d{4})/)
if (!mat) throw '!!no valid  eyr'
if (2020 > +mat[1] || +mat[1] > 2030) throw 'eyr out' + mat[1]
mat = d.match(/hgt:(\d+)(cm|in)/)
if (!mat) throw '!!no  valid hgt'
if (mat[2] === 'in') {
if (59 > +mat[1] || +mat[1] > 76) throw 'height (in) out' + mat[1]
} else {
if (150 > +mat[1] || +mat[1] > 193) throw 'height (cm) out' + mat[1]
}
mat = d.match(/hcl:#[a-f0-9]{6}/i)
if (!mat) throw 'no valid hcl'
mat = d.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)/)
if (!mat) throw 'no valid ecl'
mat = d.match(/pid:\d{9}/)
if (!mat) throw 'no valid pid'
return [null, d]
} catch (e) {
return [e, d]
}
})
;[a.filter(n => n[0] === null).length, a]
