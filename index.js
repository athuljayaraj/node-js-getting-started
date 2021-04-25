const bodyParser = require('body-parser');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const env = require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);
const waMessageBody = `Please keep such a whatsapp message filled out and handy. \n
\n
Date:  \n
\n
1. Patient Name:\n
2. SRF ID:\n
3. BU Number:\n
4. Age:  Gender:\n
5. Ward Name :   Area:\n
6. Covid Test Done?  Postive Date: \n
7. Covid Result: +VE (+ve) or -VE: \n
8. Date of first symptom ?: \n
9. SPO2 Level (Saturation): \n
10. Co-morbidities: \n
11. Symptoms now:  \n
12. Is patient on Oxygen Cylinder now?:  \n
13. What kind of bed is required - ICU, ICU with ventilator? :  \n
14. Searching Hospital Bed Since?:  \n
15. List of Hospitals Visited:  \n
16. Preferred Hospital? Pvt / Govt:  \n
17. Attender Mobile No:  \n
18. Attender relation to patient:  \n
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
    console.log(req.body);
    if (req.body.Body.toLower() == "help") {
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
      res.send(`Wrong start message`)
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
