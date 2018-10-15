var express = require('express');
var router = express.Router();

var middleware = require('../middelware/middleware');
var hcplayer_controller = require('../controllers/hcplayerController');

/* GET users listing. */
router.get('/', middleware.authenticated, hcplayer_controller.index);

router.get('/:filter', middleware.authenticated, hcplayer_controller.index);

router.get('/edit/:id', middleware.treasury, hcplayer_controller.edit);

router.get('/editallglory', middleware.treasury, hcplayer_controller.editglory);

router.post('/saveallglory/', middleware.treasury, hcplayer_controller.saveallglory);

router.get('/delete/:id', middleware.treasury, hcplayer_controller.delete);

router.post('/save', middleware.treasury, hcplayer_controller.save);

router.get('/resetpasswort/:id', middleware.treasury, hcplayer_controller.resetPassword);

module.exports = router;
