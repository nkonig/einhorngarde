var express = require('express');
var router = express.Router();

var middleware = require('../middelware/middleware');
var treasury_controller = require('../controllers/treasuryController');
var equitmant_controller = require('../controllers/equitmentController');
var season_controller = require('../controllers/seasonController');
var hcplayer_controller = require('../controllers/hcplayerController');
var clan_controller = require('../controllers/clanController');

router.get('/', middleware.treasury, treasury_controller.index);

router.get('/:clanid', middleware.treasury, treasury_controller.index);

router.post('/upload', middleware.treasury, treasury_controller.upload);

router.post('/addhcplayer', middleware.treasury , hcplayer_controller.add);

router.post('/selectseason', middleware.treasury ,  season_controller.select); // middleware.resetseason,

router.get('/season/:id/edit', middleware.treasury, season_controller.edit);

router.get('/season/:id/distribute', middleware.treasury, season_controller.distribute);

router.get('/season/:id/edit/:eqid', middleware.treasury, equitmant_controller.edit);

router.post('/eq/save', middleware.treasury, equitmant_controller.save);

router.get('/eq/delete/:eqid', middleware.treasury, equitmant_controller.delete);

router.get('/addclan', middleware.treasury, clan_controller.index);

module.exports = router;  