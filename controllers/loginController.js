var HCPlayer = require('../models/hcplayer');
var bcrypt   = require('bcrypt');
var winston = require('winston');

exports.index = function(req, res) {
    res.render('index');
};

exports.loginStub = function(req, res) {

  //Einhorngarde
  var clan = '5c325734e7179a7d123ff04e'
  //Zweihorngarde
  //var clan = '5c329056e7179a7d124000d0';

  var user = new HCPlayer({rank: 'Stellvertreter',
                           _id:  '5b98331dbb919a27c4858c53',
                           username: 'Stub User',
                           throneroom: 10,
                           clan: clan});
  //console.log('User Treasurer: ' + user.treasurer);
  var session = req.session;
  session.hcplayer = user;
  session.save();
  //console.log('session id: ' + session.id);
  //console.log(session); 
  return res.redirect('/selection');
}

exports.login = function(req, res, next) {

HCPlayer.findOne({ username: req.body.username }).populate({path: 'selection', populate: { path: 'first second third', model: 'Equitment'}}).exec(  
  function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      var err = new Error('User not found.');
      err.status = 401;
      return next(err);
    }

    if (req.body.password === 'einhorngarde123!') {
      //console.log(session);
      var session = req.session;
      session.hcplayer = user;
      session.hcplayer.selection = user.selection;
      //console.log('DEBUGGING: ' + user.selection);
      session.save();
      if(user.registert) {
        //console.log('Registert! session id: ' + session.id);
        console.log('User ' + user.username + ' logged in.');
        return res.redirect('/selection');
      } else {
        //disabled
        //var defaultPass = req.body.password === 'einhorngarde123!' ? true : false;
        var defaultPass = false;
        return res.redirect('/register/' + defaultPass);
      }
    } else {
      console.log('wrong creds for user ' +  user.username );
      /*bcrypt.hash(req.body.password, 10, function (err, hash){
        console.log('hash: ' + hash);
      });*/
      return res.redirect('/login');
    }
  })
};

exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    return res.redirect('/login');
  })
}

exports.register = function(req, res, next) {
  var session = req.session;
  var hcplayer = new HCPlayer(session.hcplayer);
  if(req.method == 'GET') {
    var options = {};
    if(req.params.default === 'true') {
        options = {password: true}; 
    }
    var data = {};
    data.hcplayer = hcplayer;
    return res.render('register',{ data: data, treasurer: hcplayer.treasurer, options: options, origin: {register: true} });
  } else { 
    var update = {};
    update.throneroom = req.body.throneroom;
    update.glory = req.body.glory;
    update.registert = true;
    if(req.body.password) {
      update.password = new String(req.body.password);
    }
    if(Number(update.glory) > 0) {
      HCPlayer.findOneAndUpdate({ _id: hcplayer._id }, update, function(err, user) {  
        if(err) return next(err); 
        session.hcplayer.throneroom = update.throneroom;  
        session.hcplayer.glory      = update.glory;
        session.hcplayer.register   = update.registert; 
        return res.redirect('/selection'); 
      });
    } else {
      return res.redirect('/register/false');
    }
  }
}