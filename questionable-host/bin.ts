// deno run ./bin.ts

import { parse } from 'https://deno.land/std@0.101.0/flags/mod.ts'
import { iter, writeAll } from 'https://deno.land/std@0.101.0/io/util.ts'
import { upload, download, downloadOld } from './upload-download.ts'

const WIDTH = 20
const encoder = new TextEncoder()
function handleProgress (progress: number): void {
  if (progress === 1) {
    console.log('\r'.padEnd(WIDTH + 10, ' '))
  } else {
    Deno.stdout.write(
      encoder.encode(
        `\r[${'#'.repeat(Math.floor(progress * WIDTH))}${' '.repeat(
          WIDTH - Math.floor(progress * WIDTH)
        )}] ${(progress * 100).toFixed(1).padStart(5, ' ')}%`
      )
    )
  }
}

const [mode, ...args] = Deno.args

if (!mode || mode.startsWith('-')) {
  console.log(
    [
      "Use Scratch's asset servers to store files.",
      '',
      'To upload a file:',
      '',
      '  deno run --allow-net --allow-read ./bin.ts upload ./path/to/file',
      '',
      'To download a file given a hash:',
      '',
      '  deno run --allow-net --allow-write ./bin.ts download \\',
      '    49f68a5c8493ec2c0bf489821c21fc3b ./path/to/file',
      '',
      'SUBCOMMANDS:',
      '    upload      Upload a file',
      '    download    Download a file'
    ].join('\n')
  )
} else if (mode === 'upload') {
  const {
    help,
    'session-id': sessionId,
    'session-id-path': sessionIdPath,
    _: [filePath]
  } = parse(args, {
    string: ['session-id', 'session-id-path'],
    boolean: ['help'],
    alias: {
      h: 'help',
      s: 'session-id',
      S: 'session-id-path'
    }
  })

  if (help) {
    console.log(
      [
        "Upload a file to Scratch's asset servers. Prints the resulting md5 hash that can",
        'be used to later download the file.',
        '',
        'Uploading files requires authentication, so you must provide your Scratch',
        "account's `scratchsessionsid` cookie. On the Scratch website whilst signed in,",
        'you can find this in DevTools (inspect element) > Application > Cookies >',
        'https://scratch.mit.edu > scratchsessionsid.',
        '',
        'Upload a file from a given path:',
        '',
        '  SCRATCHSESSIONSID="..." deno run --allow-net --allow-env --allow-read \\',
        '    ./bin.ts upload ./path/to/file',
        '',
        'Upload a file from stdin:',
        '',
        '  cat ./path/to/file | SCRATCHSESSIONSID="..." deno run --allow-net --allow-env \\',
        '    ./bin.ts upload',
        '',
        'USAGE:',
        '    deno run --allow-net --allow-env --allow-read ./bin.ts upload [OPTIONS] [FILE]',
        '',
        'If FILE is omitted, then the file contents will be read from stdin.',
        '',
        'OPTIONS:',
        '    -h, --help',
        '        Prints help information',
        '',
        '    -s, --session-id=<SCRATCHSESSIONSID>',
        '        Directly provide the `scratchsessionsid` cookie.',
        '',
        '    -S, --session-id-path=<PATH>',
        '        Provide a path to a file containing the `scratchsessionsid` cookie.',
        '',
        'ENVIRONMENT VARIABLES:',
        '    SCRATCHSESSIONSID',
        "        The Scratch account's `scratchsessionsid` cookie. (required)"
      ].join('\n')
    )
  } else {
    const chunks = []
    if (filePath !== undefined) {
      chunks.push(await Deno.readFile(String(filePath)))
    } else {
      for await (const chunk of iter(Deno.stdin)) {
        chunks.push(chunk)
      }
    }
    const scratchSessionsId: string | undefined = sessionId
      ? sessionId
      : sessionIdPath
      ? (await Deno.readTextFile(sessionIdPath)).trim()
      : Deno.env.get('SCRATCHSESSIONSID')
    if (!scratchSessionsId) {
      throw new TypeError(
        [
          'You must provide a `scratchsessionsid` cookie to authenticate the upload. You',
          'can provide it by either:',
          '',
          '  - Setting the option `--session-id=<SCRATCHSESSIONSID>` to the session ID.',
          '',
          '  - Storing the session ID in a file, then setting the option',
          '    `--session-id-path=<PATH>` to the location of the file.',
          '',
          '  - Setting the environment variable `SCRATCHSESSIONSID` to the session ID.',
          '',
          'For more information, try `deno run ./bin.ts upload --help`.'
        ].join('\n')
      )
    }
    console.log(
      await upload(new Blob(chunks), scratchSessionsId, handleProgress)
    )
  }
} else if (mode === 'download') {
  const {
    help,
    _: [hash, filePath]
  } = parse(args, {
    boolean: ['help'],
    alias: {
      h: 'help'
    }
  })

  if (help) {
    console.log(
      [
        "Download a file stored on Scratch's asset servers given the md5 hash of the file",
        'output from the `upload` subcommand.',
        '',
        'Save a file to a given path:',
        '',
        '  deno run --allow-net --allow-write ./bin.ts download \\',
        '    24310a98bae36609aa4b184e0cd20988 ./path/to/file',
        '',
        'Download a file and output it to stdout.',
        '',
        '  deno run --allow-net ./bin.ts download  24310a98bae36609aa4b184e0cd20988 \\',
        '    > ./path/to/file',
        '',
        'USAGE:',
        '    deno run --allow-net --allow-write ./bin.ts download [OPTIONS] [HASH] [PATH]',
        '',
        'If PATH is omitted, then the downloaded file will be output to stdout.',
        '',
        'OPTIONS:',
        '    -h, --help',
        '        Prints help information'
      ].join('\n')
    )
  } else {
    if (hash === undefined) {
      throw new TypeError(
        [
          'The file hash is required. For more information, try:',
          '',
          '  deno run ./bin.ts download --help'
        ].join('\n')
      )
    }
    const onProgress = filePath === undefined ? undefined : handleProgress
    const strHash = String(hash)
    let file
    if (strHash.includes('.') || strHash.includes('-')) {
      file = await downloadOld(strHash.split(/[-.]/).slice(0, -1), onProgress)
    } else {
      file = await download(strHash, onProgress)
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (filePath === undefined) {
      writeAll(Deno.stdout, bytes)
    } else {
      await Deno.writeFile(String(filePath), bytes)
    }
  }
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
