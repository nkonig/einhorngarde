var HCPlayer = require('../models/hcplayer');
var bcrypt   = require('bcrypt');

exports.authenticated = function(req, res, next) {
    //console.log('Middelware function authenticated called.')
    if(req.session.hcplayer) {
        req.session.touch();
        next();
    } else {
        res.redirect('/login');
    }
}

exports.treasury = function(req, res, next) {
    //console.log('Middelware function treasury called.')
    if(req.session.hcplayer && new HCPlayer(req.session.hcplayer).treasurer) {
        next();
    } else {
        res.redirect('/selection');
    }
}

exports.resetseason = function (req, res, next) {
    //console.log('Middelware function resetseason called.')
    var hcplayer = new HCPlayer(req.session.hcplayer);
    HCPlayer.findByIdAndUpdate(hcplayer._id, { registert: false , selection: {} }, function(err, result) {
        if(err) next(err);
        var session = req.session;
        session.hcplayer = result;
        session.save();
        console.log('Updated User! ' + hcplayer);
      });
    next();
}