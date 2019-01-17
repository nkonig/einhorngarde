var express = require('express');
var router  = express.Router();

var middleware = require('../middelware/middleware');
var warroom_controller = require('../controllers/warroomController')

router.get('/:clanid', middleware.seneschal, warroom_controller.index);

router.get('/', middleware.seneschal, warroom_controller.index);

router.post('/add', middleware.seneschal, warroom_controller.add);

module.exports = router;