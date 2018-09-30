var Season    = require('../models/season');
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
            var data = new Array();
            data.equitment = new Array();
            for(var i=0; i < season.equitment.length; i++) {
                var low  = season.equitment[i].level < hcplayer.minLevel;
                var high = season.equitment[i].level > hcplayer.maxLevel;

                var sel = new Array();
                if(selection) {
                    if(selection.first)  sel.first  = season.equitment[i]._id.toString() === selection.first._id.toString();
                    if(selection.second) sel.second = season.equitment[i]._id.toString() === selection.second._id.toString();
                    if(selection.third)  sel.third  = season.equitment[i]._id.toString() === selection.third._id.toString();
                }
                
                var options = new Array();
                options.toLow = low;
                options.toHigh = high;
                options.selection = sel;
                //options.notAuthorized = hcplayer.minGlory > hcplayer.glory;

                data.equitment.push( {
                                        raw: season.equitment[i],
                                        options: options
                                     });
            }
            res.render('selection', {data: data, treasurer: hcplayer.treasurer, origin: { selection : true } }); 
        } else {
            res.render('selection', {treasurer: hcplayer.treasurer, origin: { selection : true } }); 
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
    return res.redirect('/selection');
}
