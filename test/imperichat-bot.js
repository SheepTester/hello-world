const{ ImperichatClient }= require('imperichat-js')
const client = new ImperichatClient()

client.login("myBotId","supersecretpassword").then(console.log).catch(console.log)

function what (sectionid) {

client.onMessage(sectionid,function (message) { 
    if (message.content.startsWith("!greet")){
        client.sendMessage(sectionid,"World!").then(function (messageId) {
            console.log(`Message sent with ID ${messageId}`)
      })
    }
 })

}
what('2814671470')

