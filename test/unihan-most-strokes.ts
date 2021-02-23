// deno run --allow-read unihan-most-strokes.ts

import * as colours from 'https://deno.land/std@0.86.0/fmt/colors.ts'

const strokesRegex = /^U\+([\dA-F]+)\tkTotalStrokes\t(\d+)$/mg

// https://unicode.org/Public/UNIDATA/Unihan.zip
const unihanIRGSources = '../../../test/Unihan/Unihan_IRGSources.txt'

const sources = await Deno.readTextFile(unihanIRGSources)

const charStrokes = Array.from(
  sources.matchAll(strokesRegex),
  ([, codePoint, strokes]) => {
    return {
      char: String.fromCodePoint(parseInt(codePoint, 16)),
      strokes: +strokes,
    }
  }
)

charStrokes.sort((a, b) => b.strokes - a.strokes)

console.log(colours.bold('Strokes\tChar\tCode point'))
for (const { char, strokes } of charStrokes.slice(0, 50)) {
  const codePoint = (char.codePointAt(0) || 0)
    .toString(16)
    .toUpperCase()
    .padStart(5, ' ')
  console.log(`${strokes}\t${char}\tU+${codePoint}`)
}

/*
Strokes Char    Code point
84      𱁬      U+3106C
76      𰽔      U+30F54
64      𠔻      U+2053B
64      𪚥      U+2A6A5
58      𰻞      U+30EDE
53      𬚩      U+2C6A9
52      䨻      U+ 4A3B
48      龘      U+ 9F98
48      𦧅      U+269C5
48      𩇔      U+291D4
48      𩙤      U+29664
46      𩙣      U+29663
44      䲜      U+ 4C9C
44      𧢱      U+278B1
43      𧆘      U+27198
43      𰻝      U+30EDD
42      𦧄      U+269C4
41      𪓊      U+2A4CA
41      𮣱      U+2E8F1
40      𩇓      U+291D3
40      𪚍      U+2A68D
40      𪚎      U+2A68E
39      靐      U+ 9750
39      𡔚      U+2151A
39      𧮩      U+27BA9
38      𨐄      U+28404
38      𨰽      U+28C3D
38      𩇒      U+291D2
38      𩎑      U+29391
38      𪓉      U+2A4C9
37      𧆓      U+27193
37      𧟞      U+277DE
37      𧟟      U+277DF
37      𧢰      U+278B0
37      𨈎      U+2820E
37      𩙢      U+29662
37      𩱷      U+29C77
37      𩱸      U+29C78
37      𪛖      U+2A6D6
37      𪺚      U+2AE9A
37      𬋣      U+2C2E3
36      䨺      U+ 4A3A
36      齉      U+ 9F49
36      𡔙      U+21519
36      𡬜      U+21B1C
36      𣌠      U+23320
36      𤴒      U+24D12
36      𥎥      U+253A5
36      𧲟      U+27C9F
36      𩁵      U+29075
*/
