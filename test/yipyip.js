({Authorization_fuck:Authorization}=localStorage)
const responses = []
let has_more=true,last_id,task_responses
while (has_more) {
   ({has_more,last_id,task_responses}= await fetch('/backend/video_gen?limit=50' + (last_id?'&after='+last_id:''), {
        headers: { Authorization }}).then(r=>r.json()))
    responses.push(...task_responses)
  //  break
}
responses

bleh = responses.flatMap(a => a.generations)
    .filter(g=>new Date(g.created_at) >= new Date(2025, 5, 28, 22))//.map(g => g.id)
//.filter(g => g.url.includes('.mp4'))
.map(({url,id,created_at,title}) => 
    //({url,fileName:
    `curl -L "${url}" -o "${
    id+'_'+created_at.replace(/\D/g,'').slice(0,4+2+2+2+2+2)+'_'+title+url.match(/\.(?:mp4|png)/)[0]
    }"\n`
                                     //})
    ).join('')
