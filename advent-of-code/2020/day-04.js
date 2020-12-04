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

// was one off, for some reason, hmm
count = 0
document.body.textContent.split(/\r?\n\r?\n/).filter(entry => {
if (!entry) return
try {
const values = Object.fromEntries(entry.split(/\s+/).map(a => a.split(':')))
if (+values.byr >= 1920 && +values.byr <= 2002)
if (+values.iyr >= 2010 && +values.iyr <= 2020)
if (+values.eyr >= 2020 && +values.eyr <= 2030)
if (values.hgt.slice(-2) === 'cm' && +values.hgt.slice(0, -2) >= 150 && +values.hgt.slice(0, -2) <= 193
|| values.hgt.slice(-2) === 'in' && +values.hgt.slice(0, -2) >= 59 && +values.hgt.slice(0, -2) <= 76)
if (/^#[0-9a-f]{6}$/i.test(values.hcl))
if (['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'].includes(values.ecl))
if (/^\d{9}$/.test(values.pid))
return true
    } catch { return }
})

// part 2 attempt 1 matched this
// the regex I think matches the first 9 digits which is why method 2 is superior (values.hcl.length === 9 also works)
/*
byr:1966
cid:133 pid:9953651821 ecl:gry iyr:2020 hgt:152cm
hcl:#fffffd eyr:2026
*/
