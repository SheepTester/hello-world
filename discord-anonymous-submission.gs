const WEBHOOK_URL = 'https://discord.com/api/webhooks/...'
const COLOUR = 0xFFD400

const form = FormApp.getActiveForm()
const message = form.getItems()[0]

function handleSubmit ({ response }) {
  const content = response.getResponseForItem(message).getResponse()
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      content: '',
      embeds: [
        {
          // author: {
          //   name: 'Anonymous',
          //   url: 'https://docs.google.com/forms/d/e/.../viewform'
          // },
          description: content,
          color: COLOUR
        }
      ],
      allowed_mentions: {
        parse: []
      }
    })
  })
}

// https://developers.google.com/apps-script/guides/triggers/installable#managing_triggers_programmatically
/**
 * Creates an installable trigger for when a user responds to the form.
 */
function createSubmitTrigger () {
  // https://developers.google.com/apps-script/reference/script/form-trigger-builder#onformsubmit
  ScriptApp.newTrigger('handleSubmit')
    .forForm(form)
    .onFormSubmit()
    .create()
}
