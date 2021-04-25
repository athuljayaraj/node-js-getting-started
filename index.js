const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const accountSid = 'ACdcb9bf84f9272441b0a4688fc1f45750';
const authToken = '8b4034ea9272888ffcb96dd31bc18679';
const client = require('twilio')(accountSid, authToken);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/welcome', (req, res) => {
    client.messages
      .create({
        body: 'Your Twilio code is 1238432',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+919947846480'
      })
      .then(message => {
        console.log(message.sid)
        res.send(`PMessage sent to ${message}`)
      }
      )
      .done();
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
