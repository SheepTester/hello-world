# Advent of Code 2021

> You have **892** points.

| Day | Time     | Rank  | Score | Time     | Rank  | Score |
| --- | -------- | ----- | ----- | -------- | ----- | ----- |
| 25  | 00:10:04 | 133   | 0     | 00:10:10 | 115   | 0     |
| 24  | 01:06:40 | 89    | 12    | 01:08:30 | 75    | 26    |
| 23  | 00:56:40 | 827   | 0     | 01:42:28 | 380   | 0     |
| 22  | 00:05:28 | 74    | 27    | 01:18:51 | 625   | 0     |
| 21  | 00:04:06 | 24    | 77    | 00:59:27 | 1294  | 0     |
| 20  | 00:27:15 | 472   | 0     | 00:28:18 | 367   | 0     |
| 19  | >24h     | 11875 | 0     | >24h     | 11603 | 0     |
| 18  | 00:27:48 | 26    | 75    | 00:33:59 | 37    | 64    |
| 17  | 00:16:00 | 579   | 0     | 00:19:44 | 413   | 0     |
| 16  | 00:13:32 | 21    | 80    | 00:17:46 | 19    | 82    |
| 15  | >24h     | 27511 | 0     | >24h     | 29776 | 0     |
| 14  | 00:04:31 | 67    | 34    | 00:17:40 | 231   | 0     |
| 13  | 00:05:10 | 49    | 52    | 00:16:17 | 523   | 0     |
| 12  | 00:06:04 | 65    | 36    | 00:13:29 | 121   | 0     |
| 11  | 00:12:21 | 395   | 0     | 00:14:44 | 409   | 0     |
| 10  | 00:09:31 | 1395  | 0     | 00:19:25 | 1665  | 0     |
| 9   | 00:02:48 | 38    | 63    | 00:09:23 | 63    | 38    |
| 8   | 00:03:18 | 54    | 47    | 00:26:48 | 297   | 0     |
| 7   | 00:01:38 | 60    | 41    | 00:02:17 | 16    | 85    |
| 6   | 00:03:34 | 186   | 0     | 00:15:56 | 1339  | 0     |
| 5   | 00:06:33 | 228   | 0     | 00:08:27 | 88    | 13    |
| 4   | 00:08:52 | 133   | 0     | 00:11:29 | 110   | 0     |
| 3   | 00:02:47 | 61    | 40    | 00:10:36 | 112   | 0     |
| 2   | 00:01:56 | 213   | 0     | 00:02:58 | 103   | 0     |
| 1   | 03:00:07 | 19774 | 0     | 03:01:45 | 16916 | 0     |

## Boilerplates

December 1, in preparation for day 2

<!-- prettier-ignore -->
```js
l = document.body.textContent.trim().split(/\r?\n/) // owo
.map(Number)
```

December 2: I put the `.trim()` stuff on a new line so I could easily comment
out `document.body.textContent` to put in an example input.

<!-- prettier-ignore -->
```js
l = document.body.textContent
.trim().split(/\r?\n/) // owo v2
.map(Number)
```

December 13: I set up an anonymous function for `Array#map` since it seems the
inputs aren't just a list of numbers anymore. This way, I can also easily use it
as a for loop if I'd like.

<!-- prettier-ignore -->
```js
lines = document.body.textContent
.trim().split(/\r?\n/) // owo v3
.map(line => {
return +line
})
```

December 14: More and more of the days have chunks separated by two newlines, so
I decided to group up `\r?\n` with a noncapturing group with a quantifier. I
probably could just do with `\n\n` since Advent of Code uses LF, but whatever. I
also put a semicolon before `lines` in case I wanted to do an array destructure,
though in most cases I don't have any lines before it so it's usually not
needed.

<!-- prettier-ignore -->
```js
;lines = document.body.textContent
.trim().split(/(?:\r?\n){1}/) // owo v4
.map(line => {
return +line
})
```

December 21: I made the input page dark theme for my eyes' convenience. I also
set up the array destructure ahead of time, as well as added some indentation so
it at least starts off looking tolerable.

<!-- prettier-ignore -->
```js
document.documentElement.style.colorScheme = 'dark' // 🥰
;[...lines] = document.body.textContent
  .trim().split(/(?:\r?\n){1}/) // owo v5
  .map(line => {
    return +line
  })
```
