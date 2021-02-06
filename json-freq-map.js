class JsonFreqMap extends Map {
  constructor (...args) {
    super(...args)
    this.total = 0
    this.object = {}
    this.array = []
  }

  #add (value) {
    this.total++
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (!this.array[i]) {
            this.array[i] = new JsonFreqMap()
          }
          this.array[i].#add(value[i])
        }
      } else {
        for (const [key, val] of Object.entries(value)) {
          if (!this.object[key]) {
            this.object[key] = new JsonFreqMap()
          }
          this.object[key].#add(val)
        }
      }
    } else {
      this.set(value, (this.get(value) || 0) + 1)
    }
  }

  static analyse (jsons) {
    const map = new JsonFreqMap()
    for (const item of jsons) {
      map.#add(item)
    }
    return map
  }
}
