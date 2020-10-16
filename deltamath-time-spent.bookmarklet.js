;(async () => {
  if (!window.location.hostname.includes('deltamath')) {
    return alert('not deltamath')
  }

  const match = /\/(\d+)\/(\w+)/.exec(window.location.pathname)
  const output = $('<div class="paper-shadow">')
    .css({
      position: 'absolute',
      top: 0,
      width: 'calc(100% - 40px)',
      /*height: 'calc(100vh - 40px)',*/ margin: '20px'
    })
    .appendTo(document.body)
    .append(
      $('<button>close</button>').click(function () {
        this.parentNode.remove()
      })
    )
  if (!match) {
    output.append('this is not an assignment page')
    return
  }
  if (!window['charts lol']) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js'
    await new Promise(resolve => {
      script.onload = resolve
      document.head.appendChild(script)
    })
    window['charts lol'] = true
  }
  const [, teacher_id, sk] = match
  const { duration } = await fetch(
    'https://www.deltamath.com/new3/scripts/get_problems_by_assignment.php',
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
  ).then(r => r.json())
  const data = []
  const labels = []
  for (let i = 0; i <= 900; i += 10) {
    //labels.push(i === 900 ? '900+' : i.toString())
    data.push({ x: i, y: duration[i] || 0 })
    //data.push(duration[i] || 0)
  }
  const canvas = document.createElement('canvas')
  output.append(canvas)
  const ctx = canvas.getContext('2d')
  const chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      datasets: [
        {
          data,
          label: 'students',
          backgroundColor: 'rgba(233, 30, 99, .61)',
          borderColor: 'rgba(233, 30, 99, 1)',
          fill: true
        }
      ]
    },

    // Configuration options go here
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'time spent by students on this problem'
      },
      tooltips: {
        mode: 'index',
        intersect: false
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [
          {
            type: 'linear',
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'time spent (s)'
            }
          }
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'students'
            }
          }
        ]
      }
    }
  })
  output.append(
    '900 just means they took at least 15 minutes which is why theres so many'
  )
  return { labels, data }
})()

