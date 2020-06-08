(async () => {
  const GunnSchedule = require('awesome-new-gunn-schedule-package')
  const {apiKey} = require('./api-key.json')

  const schedule = new GunnSchedule(apiKey)
  const year = schedule.year('2019-08-13', '2020-06-04')
  await year.update()
  console.log(year.get('2019-11-21').periods)
})()

