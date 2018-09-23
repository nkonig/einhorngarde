var express = require('express');
var router = express.Router();

var middleware = require('../middelware/middleware');
var treasury_controller = require('../controllers/treasuryController');
var equitmant_controller = require('../controllers/equitmentController');

router.get('/', middleware.treasury, treasury_controller.index);

router.post('/upload', middleware.treasury, treasury_controller.upload);

router.post('/addhcplayer', middleware.treasury , treasury_controller.addhcplayer);

router.post('/selectseason', middleware.treasury ,  treasury_controller.selectseason); // middleware.resetseason,

router.get('/season/:id/edit', middleware.treasury, treasury_controller.editseason);

router.get('/season/:id/edit/:eqid', middleware.treasury, treasury_controller.editeq);

router.post('/eq/save', middleware.treasury, equitmant_controller.save);

router.get('/eq/delete/:eqid', middleware.treasury, equitmant_controller.delete);

module.exports = router;  