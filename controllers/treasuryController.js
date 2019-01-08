var Season    = require('../models/season');
var Equitment = require('../models/equitment');
var HCPlayer  = require('../models/hcplayer');
var Clan      = require('../models/clan');
var async     = require('async');

exports.index = function(req, res, next) {
    var query = req.params.clanid ? {_id: req.params.clanid} : {main: true};
    Clan.findOne( query )
        .populate({ path: 'seasons', model: 'Season' })
        .exec( function(err, clanSeasons) {
            if(err) return next(err);
            Clan.find({}, function(err, clans) {
                if(err) return next(err);
                var hcplayer = new HCPlayer(req.session.hcplayer);
                return res.render('treasury', {data: clanSeasons, clans: clans, username: hcplayer.username, rank: hcplayer.rank, treasurer: hcplayer.treasurer, origin: { treasury : true } });    
            });
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
        //console.log('Season ID ' + season._id);

        var equitIds = new Array();
        async.series([
            function(callback) {
                // add equitment
                for(var i=0; i < result.treasury.equitment.length; i++) {
                    //console.log(result.treasury.equitment[i]);
                    var equitmentJson = result.treasury.equitment[i];
                    var equitment = new Equitment(equitmentJson);
                    equitIds.push(equitment._id);
                    equitment.seasonId = season._id;
                    
                    equitment.save(function(err) {
                        if(err) return next(err);
                        //console.log('DONE! ID: ' + equitment._id);
                    });
                }

                // add usable
                for(var i=0; i < result.treasury.usable.length; i++) {
                    //console.log(result.treasury.usable[i]);
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
                season.equitment = equitIds;
                season.save(function(err) { if(err) return next(err); });
                Clan.update({ _id: result.treasury.meta.clanid}, { $push: { seasons: season._id } }, function(err) { if(err) return next(err); });
                callback(null);
            }
        ]);
    });
    return res.redirect('/treasury');
}