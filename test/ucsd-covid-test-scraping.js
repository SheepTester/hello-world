// run in https://mystudentchart.ucsd.edu/shs/app/test-results
__RequestVerificationToken = document.querySelector('[name="__RequestVerificationToken"]').value
const tests=await fetch("https://mystudentchart.ucsd.edu/shs/api/test-results/GetList", {
  "headers": {__RequestVerificationToken,
    "content-type": "application/json",
  },
  "body": JSON.stringify({"groupType":0,"searchString":"","maxResults":1000,"isCurAdmFilterEnabled":false}),
  "method": "POST",
}).then(r => r.json()).then(r => r.newResultGroups.map(x => [x.sortDate,x.key]))
console.log('tests',tests.map(x=>x[0]))
const dirHandle = await window.showDirectoryPicker();
for (const [date,key] of tests) {
const {reportID,reportVars:{ordDat,ordId}}=await fetch("https://mystudentchart.ucsd.edu/shs/api/test-results/GetDetails", {
  "headers": {__RequestVerificationToken,
    "content-type": "application/json",
  },
  "body": JSON.stringify({"orderKey":key,"organizationID":"","PageNonce":"d36cb7e8f39a4622984a99afc2f03cda"}),method:'POST'
}).then(r => r.json()).then(x => x.results[0].reportDetails)
const html=await fetch("https://mystudentchart.ucsd.edu/shs/api/report-content/LoadReportContent", {
  "headers": {__RequestVerificationToken,
    "content-type": "application/json",
  },
  "body": JSON.stringify({reportID,"assumedVariables":{ordDat,ordId},"isFullReportPage":false,"uniqueClass":"EID-13c","nonce":"d36cb7e8f39a4622984a99afc2f03cda"}),
  "method": "POST",
}).then(r => r.json()).then(r=>r.reportContent)
  const name=`${date.replaceAll(':','')} ${key}.html`
  const fileHandle = await dirHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(html);
  await writable.close();
  console.log(name)
  }
