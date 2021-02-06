export class JsonFreqMap extends Map {
  total: number
  object: { [key: string]: JsonFreqMap }
  array: JsonFreqMap[]

  static analyse (jsons: any[]): JsonFreqMap
}
