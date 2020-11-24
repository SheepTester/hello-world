const invalidDate = new Date('unknown')

export interface AudioEntry {
  description: string
  date: Date
}

/** Requires `allow-read` */
export async function getAudio (descJson: { [key: string]: string } = {}): Promise<Map<string, AudioEntry>> {
  const audioUnsorted: Map<string, AudioEntry> = new Map()
  for await (const { isFile, name } of Deno.readDir('./')) {
    if (isFile && (name.endsWith('.mp3') || name.endsWith('.wav'))) {
      const stat = await Deno.stat('./' + name)
      audioUnsorted.set(name, {
        description: descJson[name] || '',
        // NOTE: The Date column in Windows Explorer uses birthtime not mtime
        date: /* stat.mtime ?? */ stat.birthtime ?? invalidDate
      })
    }
  }
  return new Map(
    [...audioUnsorted].sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
  )
}
