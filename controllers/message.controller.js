
const https = require('https')
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

const welcomeMessage = "We're here to help. Answer the upcoming messages one by one."

exports.welcome = (req, res) => {
  console.log(req.body.Body);
  if (req.body.Body.toLowerCase() == "help") {
    sendWaMessage(req.body.WaId, welcomeMessage, (message) => {
      console.log(`Welcome message sent to ${req.body.WaId}`)
      res.send(`Message sent to ${JSON.stringify(req.body.WaId)}`)
      sendQuestionMessage(req.body.WaId);
    })
  } else {
    writeToSheet(req.body.Body, req.body.WaId);
    res.send(`Message wrote to sheet`)
  }
};

function sendQuestionMessage(whatsappId, questionNumber = 0) {
  const question = Object.values(template)[questionNumber];
  sendWaMessage(whatsappId, question, (message) => {
    console.log(`Question ${question} sent to whatsapp ID: ${message.to}`)
  })
}

function writeToSheet(message, whatsappId) {
  const data = JSON.stringify({
    message,
    whatsappId
  })
  console.log(data);
  const options = {
    hostname: 'script.google.com',
    port: 443,
    path: `/macros/s/${process.env.SHEET_ID}/exec`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', responseData => {
      const to = responseData.to;
      const question = template[d.questionNumber];
      process.stdout.write(d)
      process.stdout.write("Send next message to phone")
      sendWaMessage(to, question, (message) => {
        console.log(message.sid)
        res.send(`Message sent to ${JSON.stringify(message)}`)
      })
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}

function sendWaMessage(to, message, callback) {
  client.messages
    .create({
      body: message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${to}`
    }).then(message => callback(message)).done();

}