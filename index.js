
const path = require('path')

const PORT = process.env.PORT || 5000


const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')


// define a simple route
app.get('/', (req, res) => {
  res.json({ "message": "Welcome to Ooty! Nice to meet you." });
});
require('./routes/routes.js')(app);


// listen for requests
app.listen(PORT, () => {
  console.log("Server is listening on port ", PORT);
});