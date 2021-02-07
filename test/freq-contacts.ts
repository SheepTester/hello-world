// deno run --allow-read --allow-write test/freq-contacts.ts ~/Downloads/contacts.json
// where contacts.json is from google-contacts-scrape.js

const filePath = Deno.args[0]
if (!filePath) throw new Error('Give the path to the contacts file please')

const json: any = await Deno.readTextFile(filePath)
  .then(JSON.parse)

class JsonFreqMap extends Map<any, string[]> {
  static MAX_ENTRIES = 10
  static MAX_IDS = 5

  total: number = 0
  array: JsonFreqMap[] = []

  private add (ownerId: string, value: any) {
    this.total++
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (!this.array[i]) {
            this.array[i] = new JsonFreqMap(this.array[i])
          }
          this.array[i].add(ownerId, item)
        })
      } else {
        throw new Error('Object spotted.')
      }
    } else {
      let entry = this.get(value)
      if (!entry) {
        entry = []
        this.set(value, entry)
      }
      entry.push(ownerId)
    }
  }

  get isUnique (): boolean {
    // Just because there's only one person doesn't mean it's unique
    if (this.size <= 1) return false

    for (const ids of this.values()) {
      if (ids.length > 1) return false
    }
    return true
  }

  display (indent: string = ''): string {
    let display = `# total: ${this.total}${
      this.isUnique ? '; unique values' : ''
    }\n`
    if (this.size > 0) {
      // Sort by descending commonness
      const entries = [...this].sort((a, b) => b[1].length - a[1].length)
      for (const [value, ids] of entries.slice(0, JsonFreqMap.MAX_ENTRIES)) {
        display += indent
          + (typeof value === 'string' ? JSON.stringify(value) : value)
          + `: [${ids.length}] `
          + ids.slice(0, JsonFreqMap.MAX_IDS).join(', ')
          + (ids.length > JsonFreqMap.MAX_IDS ? ', ...' : '')
          + '\n'
      }
      if (entries.length > JsonFreqMap.MAX_ENTRIES) {
        display += indent + '...: nonexhaustive\n'
      }
      if (this.array.length) {
        display += indent + '__ARRAY__:\n'
        indent += '  '
      }
    }
    this.array.forEach((map, i) => {
      display += indent + `${i}: ${map.display(indent + '  ')}`
    })
    return display
  }

  static analyse (jsonArray: any[]): JsonFreqMap {
    const map = new JsonFreqMap()
    for (const item of jsonArray) {
      map.add(`${item[2][0][1]} <${item[9][0][1]}>`, item)
    }
    return map
  }
}

const map = JsonFreqMap.analyse(json)

await Deno.writeTextFile('./ignored/contacts-freq.yml', map.display())

await Deno.writeTextFile(
  './ignored/contacts-uuid.txt',
  json
    .map((item: any) => `${item[0]}: ${item[2][0][1]} <${item[9][0][1]}>`)
    .join('\n') + '\n',
)
