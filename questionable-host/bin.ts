// deno run ./bin.ts

import { parse } from 'https://deno.land/std@0.101.0/flags/mod.ts'
import { iter } from 'https://deno.land/std@0.101.0/io/util.ts'
import { upload, download, downloadOld } from './upload-download.ts'

const [mode, ...args] = Deno.args

if (!mode || mode.startsWith('-')) {
  console.log("Use Scratch's asset servers to store files.")
  console.log()
  console.log('To upload a file:')
  console.log()
  console.log(
    `  deno run --allow-net --allow-read ./bin.ts upload ./path/to/file`
  )
  console.log()
  console.log('To download a file given a hash:')
  console.log()
  console.log(
    `  deno run --allow-net --allow-write ./bin.ts download 49f68a5c8493ec2c0bf489821c21fc3b ./path/to/file`
  )
  console.log()
  console.log('SUBCOMMANDS:')
  console.log('    upload\tUpload a file')
  console.log('    download\tDownload a file')
} else if (mode === 'upload') {
  const {
    help,
    _: [filePath]
  } = parse(args, {
    boolean: ['help'],
    alias: {
      h: 'help'
    }
  })

  if (help) {
    console.log(
      "Upload a file to Scratch's asset servers. Prints the resulting md5 hash that can be used to later download the file."
    )
    console.log()
    console.log('Upload a file from a given path:')
    console.log()
    console.log(
      `  deno run --allow-net --allow-read ./bin.ts upload ./path/to/file`
    )
    console.log()
    console.log('Upload a file from stdin:')
    console.log()
    console.log(`  deno run --allow-net ./bin.ts upload`)
    console.log()
    console.log('USAGE:')
    console.log(
      '    deno run --allow-net --allow-read ./bin.ts upload [OPTIONS] [FILE]'
    )
    console.log()
    console.log(
      'If FILE is omitted, then the file contents will be read from stdin.'
    )
    console.log()
    console.log('OPTIONS:')
    console.log('\t-h, --help')
    console.log('\t\tPrints help information')
  } else {
    // TODO: Get session ID
    const chunks = []
    if (filePath !== undefined) {
      chunks.push(await Deno.readFile(String(filePath)))
    } else {
      for await (const chunk of iter(Deno.stdin)) {
        chunks.push(chunk)
      }
    }
    console.log(await upload(new Blob(chunks), 'TODO'))
  }
} else if (mode === 'download') {
  //
} else {
  console.log(`I wasn't expecting a subcommand ${Deno.inspect(mode)}.`)
  console.log()
  console.log('USAGE:')
  console.log(
    '    deno run --allow-net --allow-read --allow-write ./bin.ts [SUBCOMMAND] [OPTIONS]'
  )
  console.log()
  console.log('For more information, try `deno run ./bin.ts --help`.')
}
