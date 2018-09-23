var Season    = require('../models/season');
var Equitment = require('../models/equitment');
var HCPlayer  = require('../models/hcplayer');
var async = require('async');

exports.index = function(req, res, next) {
    Season.find({}, function(err, result) {
        if(err) return next(err);
        var hcplayer = new HCPlayer(req.session.hcplayer);
        //console.log('HCPlayer: ' + result);
        return res.render('treasury', {data: result, username: hcplayer.username, rank: hcplayer.rank, treasurer: hcplayer.treasurer, origin: { treasury : true } });
   });
} 

exports.upload = function(req, res, next) {    
    var parseString = require('xml2js').parseString;
    parseString(req.files.clantruhe.data, {
        explicitArray: false, // keine expliziten Arrays
        ignoreAttrs : false // keine Attribute
        }, function (err, result) {
        console.dir(JSON.stringify(result));

        //var startDate = new Date(result.treasury.meta.start)
        //var endDate   = new Date(result.treasury.meta.end);

        var season = new Season({ start: result.treasury.meta.start, end: result.treasury.meta.end });
        console.log('Season ID ' + season._id);

        var equitIds = new Array();
        async.series([
            function(callback) {
                // add equitment
                for(var i=0; i < result.treasury.equitment.length; i++) {
                    console.log(result.treasury.equitment[i]);
                    var equitmentJson = result.treasury.equitment[i];
                    var equitment = new Equitment(equitmentJson);
                    equitIds.push(equitment._id);
                    //equitment.seasonId = season._id;
                    
                    equitment.save(function(err) {
                        if(err) return next(err);
                        console.log('DONE! ID: ' + equitment._id);
                    });
                }

                // add usable
                for(var i=0; i < result.treasury.usable.length; i++) {
                    console.log(result.treasury.usable[i]);
                    var usableJson = result.treasury.usable[i];
                    var id = Buffer.from(usableJson.name).toString('base64').substr(0, 24);
                    //console.log('XXXXX ' + typeof id);
                    //console.log('XXXXX ' + id);
                    var equitment = new Equitment(usableJson);
                    //equitment._id = mongoose.Types.ObjectId('R2VzdW5kaGVpdCBFZGVsc3Rl');
                    equitIds.push(equitment._id);
                    if(usableJson.$ && usableJson.$.count) {
                        var count = parseInt(usableJson.$.count);
                        equitment.count = count;
                       //for(var y=0; y < count; y++) {
                       //   equitIds.push(equitment._id);
                       //}
                    }
                    //equitment.seasonId = season._id;
                    equitment.save(function(err) {
                        if(err) return next(err);
                        //console.log('DONE! ID: ' + equitment._id);
                    });

                    /*
                    Equitment.findOne({name: usableJson.name}, function(err, result) {
                        if(err) return next(err);
                        if(result) {
                            equitIds.push(result._id);
                        } else {
                            var equitmentObt = new Equitment(result);
                            equitIds.push(equitmentObt._id);
                            //equitmentObt.seasonId = season._id;
                            equitmentObt.save(function(err) {
                                if(err) return next(err);
                                console.log('DONE! ID: ' + equitmentObt._id);
                            });
                        }
                    });*/
                }

                callback(null);
            }, 
            function(callback) {
                console.log('Add ' + equitIds.length + ' Equitment IDs: ' + equitIds);
                season.equitment = equitIds;
                season.save(function(err) {
                    if(err) return next(err);
                    console.log('Season Saved!');
                });
                callback(null,);
            }
        ]);
    });
    res.redirect('/treasury');
}

exports.addhcplayer = function(req, res, next) {
    //if(err) return handleError(err);
    console.log('username: ' + req.body.username);
    console.log('rolle: '    + req.body.rolle);

    var hcplayer = new HCPlayer({username: req.body.username, rank: req.body.rolle, password: 'einhorngarde123!'});

    hcplayer.save(function(err) {
        if(err) return next(err);
    });

    res.redirect('/treasury');
}

exports.selectseason = function(req, res, next) {
    Season.findOne({current: true}, function(err, result) {
        if(err) return next(err);
        Season.findByIdAndUpdate(result._id, {current: false}, function(err, result) { 
            if(err) return next(err);
            var selectedId = req.body.seasonradio;
            Season.findByIdAndUpdate(selectedId, {current: true}, function(err, result) {
                if(err) return next(err);
                console.log('Updateted: ' + result._id + ' to true.');
            });
            console.log('Updateted: ' + result._id + ' to false.');
        });
    });
    res.redirect('/treasury');
}

exports.editseason = function(req, res, next) {
    console.log('edit season ' + req.params.id);
    var hcplayer = new HCPlayer(req.session.hcplayer);
    var season = Season.findById(req.params.id).populate('equitment');
    season.exec(function(err, season) {
        if(err) return next(err);
        return res.render('editseason', {data: season, treasurer: hcplayer.treasurer, origin: { treasury : true } });
    })
}

exports.editeq = function(req, res, next) {
    var hcplayer = new HCPlayer(req.session.hcplayer);
    if(req.params.eqid === 'new') {
        var equitment = new Equitment();
        var options = {exists: false};
        return res.render('editeq', {data: equitment, treasurer: hcplayer.treasurer, options: options, seasonid: req.params.id, origin: { treasury : true } });
    } else {
        console.log('edit equitment ' + req.params.eqid);
        var eq = Equitment.findById(req.params.eqid);
        eq.exec(function(err, eq) {
            if(err) return next(err);
            console.log('ID: ' + req.params.id);
            var options = {exists: true};
            return res.render('editeq', {data: eq, treasurer: hcplayer.treasurer, options: options, seasonid: req.params.id, origin: { treasury : true } });
        });
    }
}