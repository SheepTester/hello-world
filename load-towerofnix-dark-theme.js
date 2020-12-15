// Loads CSS by @towerofnix
// Gist https://gist.github.com/towerofnix/806550f907da63f63f55bb39c99789bf
// From https://github.com/LLK/scratch-gui/issues/59#issuecomment-455717312

fetch('https://gist.githubusercontent.com/towerofnix/806550f907da63f63f55bb39c99789bf/raw/s3-dark.css')
  .then(r => r.text())
  .then(css => {
    const style = document.createElement('style')
    style.innerHTML = css
    document.head.appendChild(style)
  })
