const vm = require('vm')
const fs = require('fs/promises')
const { minify } = require('terser')
const { js: beautify } = require('js-beautify')

async function attemptDeobfuscation (jsFile) {
  const sandbox = { console: null }
  vm.createContext(sandbox)
  try {
    vm.runInContext(jsFile, sandbox)
  } catch {
    //
  }
  let decode, strArrayName
  for (const [name, value] of Object.entries(sandbox)) {
    if (typeof value === 'function') {
      decode = value
    } else if (Array.isArray(value)) {
      strArrayName = name
    }
  }
  if (!decode) {
    throw new Error('Couldn\'t get decoder function')
  }
  const newCode = `(() => {${
    jsFile.replace(/\w+\((0x[0-9a-fA-F]+|\d+)\)/g, (match, number) => {
      try {
        const value = decode(number)
        return typeof value === 'string'
          ? JSON.stringify(value)
          : match
      } catch {
        return match
      }
    }).replace('];', `];${strArrayName} = ['... strings omitted ...'];`)
  }})()`
  console.log('minifying (to mangle variable names)')
  const { code } = await minify(newCode, {
    nameCache: {}
  })
  console.log('pretty printing')
  return beautify(code, {
    indent_size: 2
  })
}

async function main () {
  await fs.writeFile(
    './output.js',
    await attemptDeobfuscation(await fs.readFile('./app/main/index.js', 'utf8'))
  )
}

if (require.main === module) {
  main()
}
