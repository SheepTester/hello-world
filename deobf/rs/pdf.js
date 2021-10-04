// $ node deobf/rs/pdf.js

const { createWriteStream } = require('fs')
const fs = require('fs/promises')
const { resolve } = require('path')
const PDFDocument = require('pdfkit')
const doc = new PDFDocument({ autoFirstPage: false })

const {
  meta: { total_count: pageCount }
} = require('./pages/files/pages.json')
const contents = require('./pages/files/contents.json')

const htmlEscapes = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }
const fonts = {
  'sans-serif': 'Helvetica',
  serif: 'Times-Roman',
  monospace: 'Courier'
}

async function main () {
  doc.pipe(createWriteStream(resolve(__dirname, './out.pdf')))

  let i

  function * addOutlineItems (items, target) {
    if (target === doc) yield
    for (const { label, pageIndex, children } of items) {
      while (i + 1 < pageIndex) yield
      const section = target.addItem(label, { expanded: true })
      yield * addOutlineItems(children, section)
    }
  }
  const outlineItems = addOutlineItems(contents, doc.outline)

  for (i = 0; i < pageCount; i++) {
    const pageId = (i + 1).toString().padStart(pageCount.toString().length, '0')

    // Hardcoding dimensions :( (idk how to get width/height from jpg)
    doc.addPage({ size: [17 * 72, 22 * 72] })

    const html = await fs.readFile(
      resolve(__dirname, `./pages/${pageId}.html`),
      'utf-8'
    )
    const remains = html.replace(
      /<span style="left: (-?\d+(?:\.\d+)?)px; top: (-?\d+(?:\.\d+)?)px; font-size: (\d+(?:\.\d+)?)px; font-family: ((?:sans-)?serif|monospace);(?: transform:(?: rotate\((-?\d+(?:\.\d+)?)deg\))?(?: scaleX\((\d+(?:\.\d+)?)\))?;)?">([^<]+)<\/span>/g,
      (
        _,
        left,
        top,
        fontSize,
        fontFamily,
        rotation = 0,
        scaleX = 1,
        content
      ) => {
        doc
          .save()
          .fontSize(+fontSize)
          .font(fonts[fontFamily])
          .translate(+left, +top)
          .rotate(rotation)
          .scale(scaleX, 1)
          .translate(-left, -top)
          .text(
            content.replace(/&([^;]+);/g, (_, name) => {
              if (name.startsWith('#x')) {
                return String.fromCodePoint(parseInt(name.slice(2), 16))
              } else if (htmlEscapes[name]) {
                return htmlEscapes[name]
              } else {
                throw new Error(`What is &${name};?`)
              }
            }),
            +left,
            +top,
            { lineBreak: false }
          )
          .restore()
        return ''
      }
    )
    if (remains.includes('span>')) {
      throw new Error('The <span> regex was not exhaustive:\n' + remains)
    }

    outlineItems.next()
  }

  doc.end()
}

main()
