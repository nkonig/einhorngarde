var express = require('express');
var router  = express.Router();

var middleware = require('../middelware/middleware');
var warroom_controller = require('../controllers/warroomController')

router.get('/', middleware.seneschal, warroom_controller.index);

router.post('/addStats', middleware.seneschal, warroom_controller.addStats);

module.exports = router;