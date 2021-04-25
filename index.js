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
  preferredHospital: "Preferred Hospital",
  attenderMobileNumber: "Attender Mobile No",
  attenderRelationToPatient: "Attender relation to patient"
}
const waMessageBody = `Please keep such a whatsapp message filled out and handy. \n
1. ${template.patientName}:\n
2. ${template.srfId}:\n
3. ${template.buNumber}:\n
4. ${template.age}:\n
5. ${template.gender}:\n
6. ${template.wardName}:\n
7. ${template.area}:\n
8. ${template.covidTestDone}?:\n
9. ${template.positiveDate}:\n
10. ${template.covidResult}:\n
11. ${template.dateOfFirstSymptom}:\n
12. ${template.spo2Level}:\n
13. ${template.coMorbidities}:\n
14. ${template.symptomsNow}:\n
15. ${template.isPatientOnOxygenCylinderNow}:\n
16. ${template.bedRequired}:\n
17. ${template.searchingHospitalBedSince}:\n
18. ${template.hospitalsVisited}:\n
19. ${template.preferredHospital}:\n
20. ${template.attenderMobileNumber}:\n
21. ${template.attenderRelationToPatient}:\n
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
  console.log(Object.keys(messageBody))
  const messageValue = {
    patientName: messages[2].split(`${template.patientName}:`)[1],
    srfId: messages[3].split(`${template.srfId}:`)[1]
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