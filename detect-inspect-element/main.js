async function main () {
  await navigator.serviceWorker.register('./sw.js')

  if (!navigator.serviceWorker.controller) {
    window.location.reload()
  }
}

main()

//# sourceMappingURL=./main.js.map
