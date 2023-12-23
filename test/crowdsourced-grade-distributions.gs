// Based on https://github.com/SheepTester/hello-world/blob/master/discord-anonymous-submission.gs

const form = FormApp.getActiveForm()
const message = form.getItems()[0]
const sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1bHM85YCH-WARXLoA9v1s4ZlyWziWbCzUtyqWwCDD1v8/')

// Note: you only have to run this once, not after every change to `handleSubmit`
function createSubmitTrigger () {
  ScriptApp.newTrigger('handleSubmit')
    .forForm(form)
    .onFormSubmit()
    .create()
}

// https://gist.github.com/rcknr/ad7d4623b0a2d90415323f96e634cdee
function md5 (string) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, string)
    .reduce((output, byte) => output + (byte & 255).toString(16).padStart(2, '0'), '')
}

function handleSubmit ({ response }) {
  const time = response.getTimestamp().toISOString()
  const id = md5(response.getRespondentEmail().split('@')[0])
  const content = JSON.parse(response.getResponseForItem(message).getResponse())
  for (const { term, course, professor, grades } of content) {
    sheet.appendRow([time, id, term, course, professor, grades.map(([grade, count]) => `${grade}:${count}`).join(' ')])
  }
}
