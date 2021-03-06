function getAssignment (teacher_id, sk) {
  return fetch(
    '/new3/scripts/get_problems_by_assignment.php',
    {
      method: 'POST',
      body: JSON.stringify({
        last_edit: (Date.now() / 1000) | 0,
        teacher_id,
        sk
      }),
      headers: {
        Authorization: `Bearer ${window.localStorage.id_token}`
      }
    }
  )
    .then(r => r.json())
}
function getCurrentAssignment () {
  const match = /\/(\d+)\/(\w+)/.exec(window.location.pathname)
  if (!match) {
    alert('not deltamath assignment')
    return Promise.reject(new Error('Not a DeltaMath assignment'))
  }
  const [, teacher_id, sk] = match
  return getAssignment(teacher_id, sk)
}
async function main () {
  const uniqueId = `happy-${Date.now()}-`
  const {
    lines,
    lines_encode,
    _id,
    inlineSolutionCode
  } = await getCurrentAssignment()
  const linesDecoded = lines_encode
    ? JSON.parse(CryptoJS.AES.decrypt(
      lines_encode,
      _id + '',
      { format: CryptoJSAesJson }
    ).toString(CryptoJS.enc.Utf8))
    : []
  const solutions = [...lines, ...linesDecoded]
  console.log(solutions)
  const wrapper = document.createElement('div')
  wrapper.className = 'display-problem problem-page paper-shadow'
  wrapper.style = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 80px;
    resize: both;
  `
  const removeBtn = document.createElement('button')
  removeBtn.className = 'btn btn-default btn-sm'
  const removeIcon = document.createElement('b')
  removeIcon.className = 'glyphicon glyphicon-remove'
  removeBtn.append(removeIcon, 'Close')
  wrapper.appendChild(removeBtn)
  removeBtn.addEventListener('click', () => {
    wrapper.remove()
  })
  for (const { type, format, ...data } of solutions) {
    const row = document.createElement('div')
    row.className = 'row hasJax'
    switch (type) {
      case 'line': {
        const span = document.createElement('div')
        span.className = 'jax col-sm-9 col-xs-12'
        katex.render(data.line + '', span, {
          throwOnError: false,
          displayMode: true
        })
        row.appendChild(span)
        break
      }
      case 'html': {
        const span = document.createElement('div')
        span.className = 'problem-html col-xs-12'
        span.style.textAlign = 'center'
        span.innerHTML = data.html
          // namespace IDs to avoid confusion with DeltaMath
          .replace(/id="/g, '$&' + uniqueId)
        renderMathInElement(span, getRenderMathSettings())
        row.appendChild(span)
        break
      }
      case 'eq': {
        const left = document.createElement('div')
        left.className = 'jax left-equation col-sm-4 col-xs-5'
        katex.render(data.left + '=', left, {
          throwOnError: false,
          displayMode: true
        })
        row.appendChild(left)
        const right = document.createElement('div')
        right.className = 'jax right-equation col-sm-4 col-xs-5'
        katex.render('\\,\\,' + data.right, right, {
          throwOnError: false,
          displayMode: true
        })
        row.appendChild(right)
        break
      }
      default: {
        console.warn('Interesting row type', type, data)
      }
    }
    if (data.exp) {
      const explanation = document.createElement('div')
      explanation.className = 'col-sm-3 hidden-xs explanation'
      explanation.textContent = data.exp
      renderMathInElement(explanation, getRenderMathSettings())
      row.appendChild(explanation)
    }
    const { space, size, ...other } = format
    if (Object.keys(other).length) {
      console.warn('Interesting format', other)
    }
    if (space) row.style.marginTop = space + 'px'
    if (size) row.style.fontSize = size
    wrapper.appendChild(row)
  }
  document.body.appendChild(wrapper)
  if (inlineSolutionCode) {
    // eval >:(
    eval(inlineSolutionCode
      .replace(/new DeltaGraph\("/g, '$&' + uniqueId))
  }
  for (const svg of wrapper.querySelectorAll('svg')) {
    svg.style.width = '100vw'
  }
}
main()
