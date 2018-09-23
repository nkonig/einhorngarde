var express = require('express');
var router = express.Router();

var middleware = require('../middelware/middleware');
var login_controller = require('../controllers/loginController');

/* GET home page. */
router.get('/', middleware.authenticated, function(req, res) {
  res.redirect('/selection');
}); 

router.get('/login', login_controller.index);

router.get('/logout', login_controller.logout);

router.post('/login' , login_controller.login);
//router.post('/login' , login_controller.loginStub);

router.post('/logout', login_controller.logout);

router.get('/register/:default', middleware.authenticated, login_controller.register);
router.post('/register', middleware.authenticated, login_controller.register);

module.exports = router;
  