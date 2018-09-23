var Season    = require('../models/season');
var Equitment = require('../models/equitment');
var Selection = require('../models/selection');
var HCPlayer = require('../models/hcplayer');

exports.index = function(req, res, next) {
    var season = Season.findOne({current: true}).populate('equitment');
    season.exec( function(err, season) {
       if(err) handleError(err);

       var hcplayer = new HCPlayer(req.session.hcplayer);
       //console.log('Found: ' + JSON.stringify(result));
       Selection.findOne({hcplayer: hcplayer._id, season: season._id }, function(err, selection) {
        if(err) return next(err); 
        if(season) {
            var options = {selection: false};
            if(selection) {
                options = {
                    selection: {
                    first: selection.first,
                    second: selection.second,
                    third: selection.third
                    }
                };
            }
            res.render('selection', {data: season, treasurer: hcplayer.treasurer, options:  options, origin: { selection : true } }); 
        } else {
            res.render('selection', {treasurer: hcplayer.treasurer, options: options, origin: { selection : true } }); 
        }
       });
       
    });
}

exports.select = function(req, res, next) {

    Season.findOne({current: true}, function(err, season) {
        if(err) return next(err);
        
        var user = new HCPlayer(req.session.hcplayer);
        var selectionQuery = Selection.findOne({season: season._id, hcplayer: user._id });
        selectionQuery.exec(function (err, result) {
            if(err) return next(err);
            console.log(result);
            if(result) {
                Selection.updateOne({season: season._id, hcplayer: user._id }, 
                                    {first: req.body.firstradio, second: req.body.secondradio, third: req.body.thirdradio }, function (err) {
                    if(err) return next(err);;
                });
                HCPlayer.updateOne({_id: user._id }, {selection: result._id}, function(err) {
                    if(err) return next(err);;
                    console.log('Selection updateted');
                });
                user.selection = result;
                req.session.hcplayer = user;
                req.session.save();
            } else {
                var selection = new Selection({hcplayer: req.session.hcplayer._id, 
                                               season: season._id, 
                                               first: req.body.firstradio, 
                                               second: req.body.secondradio, 
                                               third: req.body.thirdradio,
                                               interest: 'need'});
                selection.save(function(err) {
                    if(err) return next(err);;
                    console.log('Selection Saved!');
                });
    
                HCPlayer.findByIdAndUpdate(user._id, {selection: selection._id}, function(err, result) {
                    if(err) return next(err);;
                       console.log('Selection Saved!');
                });
                user.selection = selection;
                req.session.hcplayer = user;
                req.session.save();
            }
        });                
    });
    res.redirect('/selection');
}
