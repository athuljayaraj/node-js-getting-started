
const { https } = require('follow-redirects');
const env = require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const template = {
  patientName: "Patient Name",
  srfId: "SRF ID",
  buNumber: "BU Number",
  age: "Age(in Years)",
  gender: "Gender(Male/Female)",
  wardName: "Ward Name",
  area: "Area",
  covidTestDone: "Covid Test Done? (Y/N)",
  covidResult: "Covid Result (+/-)",
  positiveDate: "Date of last Covid+ result (dd/mm/yyyy)",
  dateOfFirstSymptom: "Date of first symptom (dd/mm/yyyy)",
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
const confirmRecap = "Please verify the below details. If incorrect, please type 'help' to resubmit the details.\n"
const thanksMessage = "Stay safe and strong. Our volunteers will get in touch with you immediately."

exports.welcome = (req, res) => {
  console.log(req.body.Body, req.body.WaId);
  if (req.body.Body.toLowerCase() == "help") {
    sendWaMessage(req.body.WaId, welcomeMessage, (message) => {
      console.log(`Welcome message sent to ${req.body.WaId}`)
      res.send(`Message sent to ${JSON.stringify(req.body.WaId)}`)
      sendQuestionMessage(`+${req.body.WaId}`);
      writeToSheet(req.body.WaId, "", true)
    })
  } else {
    writeToSheet(req.body.WaId, req.body.Body);
    res.send(`Message wrote to sheet`)
  }
};

function sendQuestionMessage(whatsappId, questionNumber = 0) {
  const question = Object.values(template)[questionNumber];
  if (question) {
    sendWaMessage(whatsappId, question, (message) => {
      console.log(`Question ${question} sent to whatsapp ID: ${whatsappId}`)
    })
  }
}

function writeToSheet(whatsappId, message, newMessage = false) {
  const data = JSON.stringify({
    message,
    whatsappId,
    newMessage
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

  let responseData = []
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', (chunk) => {
      responseData.push(chunk);
    }).on('end', () => {
      responseData = Buffer.concat(responseData).toString();
      console.log(responseData);
      responseData = JSON.parse(responseData);
      const to = responseData.whatsappId;
      if (responseData.nextQuestion) {
        const nextQuestionNumber = responseData.nextQuestion.charCodeAt() - 'A'.charCodeAt() - 3;
        sendQuestionMessage(to, nextQuestionNumber)
        console.log(`Sending next message to phone ${to}`)
      } else if (responseData.recap) {
        const recapMessage = buildRecapMessage(responseData.recap)
        sendWaMessage(to, recapMessage, (message) => {
          console.log(`Recap sent to whatsapp ID: ${to}`)
        })
      }
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

function buildRecapMessage(recap) {
  console.log(recap)
  let recapMessage = confirmRecap + '\n';
  const keys = Object.keys(template);
  for (i = 0; i < keys.length; i++) {
    recapMessage = recapMessage + `${template[keys[i]]}: ${recap[i + 3]}\n`
  }
  recapMessage = recapMessage + `\n${thanksMessage}`;
  return recapMessage;
}