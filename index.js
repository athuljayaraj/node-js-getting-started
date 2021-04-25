const bodyParser = require('body-parser');
const express = require('express')
const path = require('path')
const https = require('https')

const PORT = process.env.PORT || 5000
const env = require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const template = {
  patientName: "Patient Name",
  srfId: "SRF ID",
  buNumber: "BU Number",
  age: "Age",
  gender: "Gender",
  wardName: "Ward Name",
  area: "Area",
  covidTestDone: "Covid Test Done?",
  positiveDate: "Postive Date",
  covidResult: "Covid Result",
  dateOfFirstSymptom: "Date of first symptom",
  spo2Level: "SPO2 Level (Saturation)",
  coMorbidities: "Co-morbidities",
  symptomsNow: "Symptoms now",
  isPatientOnOxygenCylinderNow: "Is patient on Oxygen Cylinder now",
  bedRequired: "What kind of bed is required - ICU, ICU with ventilator?",
  searchingHospitalBedSince: "Searching Hospital Bed Since",
  hospitalsVisited: "List of Hospitals Visited",
  preferredHospital: "Preferred Hospital? Pvt / Govt",
  attenderMobileNumber: "Attender Mobile No",
  attenderRelationToPatient: "Attender relation to patient"
}
const waMessageBody = `Please keep such a whatsapp message filled out and handy. \n
1. ${template.patientName}:
2. ${template.srfId}:
3. ${template.buNumber}:
4. ${template.age}:
5. ${template.gender}:
6. ${template.wardName}:
7. ${template.area}:
8. ${template.covidTestDone}?:
9. ${template.positiveDate}:
10. ${template.covidResult}:
11. ${template.dateOfFirstSymptom}:
12. ${template.spo2Level}:
13. ${template.coMorbidities}:
14. ${template.symptomsNow}:
15. ${template.isPatientOnOxygenCylinderNow}:
16. ${template.bedRequired}:
17. ${template.searchingHospitalBedSince}:
18. ${template.hospitalsVisited}:
19. ${template.preferredHospital}:
20. ${template.attenderMobileNumber}:
21. ${template.attenderRelationToPatient}:
\n
NOTE : Keep the attender mobile free for hospital / BBMP call about beds.yes we will try.`

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/welcome', (req, res) => {
    console.log(req.body.Body);
    if (req.body.Body.toLowerCase() == "help") {
      client.messages
        .create({
          body: waMessageBody,
          from: 'whatsapp:+14155238886',
          to: `whatsapp:+${req.body.WaId}`
        })
        .then(message => {
          console.log(message.sid)
          res.send(`Message sent to ${JSON.stringify(message)}`)
        }
        )
        .done();
    } else {
      const parsedMessage = parseMessage(req.body.Body);
      writeToSheet(parsedMessage)
      res.send(`Message wrote to sheet`)
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))


function parseMessage(messageBody) {
  const messages = messageBody.split('\n');
  const messageValue = {
    patientName: messages[2].split(`${template.patientName}:`)[1],
    srfId: messages[3].split(`${template.srfId}:`)[1],
    buNumber: messages[4].split(`${template.buNumber}:`)[1],
    age: messages[5].split(`${template.age}:`)[1],
    gender: messages[6].split(`${template.gender}:`)[1],
    wardName: messages[7].split(`${template.wardName}:`)[1],
    area: messages[8].split(`${template.area}:`)[1],
    covidTestDone: messages[9].split(`${template.covidTestDone}:`)[1],
    positiveDate: messages[10].split(`${template.positiveDate}:`)[1],
    covidResult: messages[11].split(`${template.covidResult}:`)[1],
    dateOfFirstSymptom: messages[12].split(`${template.dateOfFirstSymptom}:`)[1],
    spo2Level: messages[13].split(`${template.spo2Level}:`)[1],
    coMorbidities: messages[14].split(`${template.coMorbidities}:`)[1],
    symptomsNow: messages[15].split(`${template.symptomsNow}:`)[1],
    isPatientOnOxygenCylinderNow: messages[16].split(`${template.isPatientOnOxygenCylinderNow}:`)[1],
    bedRequired: messages[17].split(`${template.bedRequired}:`)[1],
    searchingHospitalBedSince: messages[18].split(`${template.searchingHospitalBedSince}:`)[1],
    hospitalsVisited: messages[19].split(`${template.hospitalsVisited}:`)[1],
    preferredHospital: messages[20].split(`${template.preferredHospital}:`)[1],
    attenderMobileNumber: messages[21].split(`${template.attenderMobileNumber}:`)[1],
    attenderRelationToPatient: messages[22].split(`${template.attenderRelationToPatient}:`)[1],
  }

  return messageValue;
}

function writeToSheet(message) {

  const data = JSON.stringify(message)
  console.log(data);
  const options = {
    hostname: 'script.google.com',
    port: 443,
    path: '/macros/s/AKfycbxFMpOqf7IIlNYTxxQU1ZRNDM3ML9XyeoLTnOFGH65TSrNPgy53amqaCHYDAq8huwzJ7A/exec',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}