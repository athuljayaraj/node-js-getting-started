module.exports = (app) => {
  const message = require('../controllers/message.controller.js');

  app.post('/welcome', message.welcome);

  app.get('/', (req, res) => res.render('pages/index'))
}