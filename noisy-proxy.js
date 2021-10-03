const handlers = {
  apply: (_, thisArg, args) => {
    console.log('%c[proxy.apply]', 'color: violet; font-weight: bold', { this: thisArg, args })
    return proxy
  },
  construct: (_, args) => {
    console.log('%c[proxy.construct]', 'color: violet; font-weight: bold', { args })
    return proxy
  },
  defineProperty: (_, property, descriptor) => {
    console.log('%c[proxy.defineProperty]', 'color: violet; font-weight: bold', { property, descriptor })
    return true
  },
  deleteProperty: (_, property) => {
    console.log('%c[proxy.deleteProperty]', 'color: violet; font-weight: bold', { property })
    return true
  },
  get: (_, property) => {
    console.log('%c[proxy.get]', 'color: violet; font-weight: bold', { property })
    return property === Symbol.toPrimitive
      ? primitiveProxy
    : proxy
  },
  getOwnPropertyDescriptor: (_, property) => {
    console.log('%c[proxy.getOwnPropertyDescriptor]', 'color: violet; font-weight: bold', { property })
    return proxy
  },
  getPrototypeOf: () => {
    console.log('%c[proxy.getPrototypeOf]', 'color: violet; font-weight: bold')
    return proxy
  },
  has: (_, property) => {
    console.log('%c[proxy.has]', 'color: violet; font-weight: bold', { property })
    return true
  },
  isExtensible: () => {
    console.log('%c[proxy.isExtensible]', 'color: violet; font-weight: bold')
    return true
  },
  ownKeys: () => {
    console.log('%c[proxy.ownKeys]', 'color: violet; font-weight: bold')
    return proxy
  },
  preventExtensions: () => {
    console.log('%c[proxy.preventExtensions]', 'color: violet; font-weight: bold')
    return true
  },
  set: (_, property, value) => {
    console.log('%c[proxy.set]', 'color: violet; font-weight: bold', { property, value })
    return true
  },
  setPrototypeOf: (_, prototype) => {
    console.log('%c[proxy.setPrototypeOf]', 'color: violet; font-weight: bold', { prototype })
    return true
  },
}
const proxy = new Proxy(() => {}, handlers)
const primitiveProxy = new Proxy(() => {}, {
  ...handlers,
  apply: (_, thisArg, args) => {
    console.log('%c[primitiveProxy.apply]', 'color: plum; font-weight: bold', { this: thisArg, args })
    return 4
  }
})
