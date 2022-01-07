// Part 1 - devtools autocomplete is too aggressive
x = 0, d = 0
l = document.body.textContent.trim().split(/\r?\n/) // owo
.map(cmd => {
[type, arg] = cmd.split(' ')
arg = +arg
if (type === 'forward') x += arg 
if (type === 'down') d += arg 
else if (type === 'up') d -= arg
})
x * d 

// Part 2
x = 0, d = 0, aim = 0
l = document.body.textContent.trim().split(/\r?\n/) // owo
.map(cmd => {
[type, arg] = cmd.split(' ')
arg = +arg
if (type === 'forward') x += arg, d += arg  * aim
if (type === 'down') aim += arg 
else if (type === 'up') aim -= arg
})
x * d 
