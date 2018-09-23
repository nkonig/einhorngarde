var express = require('express');
var router = express.Router();

var middleware = require('../middelware/middleware');
var selection_controller = require('../controllers/selectionController');


router.get('/', middleware.authenticated, selection_controller.index);

router.post('/select' , middleware.authenticated, selection_controller.select);

module.exports = router;  