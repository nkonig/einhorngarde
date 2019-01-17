var Season    = require('../models/season');
var Equitment = require('../models/equitment');
var HCPlayer  = require('../models/hcplayer');
var Clan      = require('../models/clan');
var date      = require('date-and-time');
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
                //remove next season
                clanSeasons.seasons.forEach(function(season, index, array) {
                    if (season.next) {
                        array.splice(index, 1);
                    }
                  });
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
        
        Season.findOne({start: result.treasury.meta.start, end: result.treasury.meta.end}, function(err, season) {
            if(err) return next(err);
            if(season) console.log('Found');
            var season = season ? season : new Season({ start: result.treasury.meta.start, end: result.treasury.meta.end });
            season.next = false;

            //if 
            var startNext = date.parse(result.treasury.meta.start, 'DD.MM.YYYY');
            startNext.setDate(startNext.getDate()+14);
            var nextStartString = date.format(startNext, 'DD.MM.YYYY');
            Season.findOne({start: nextStartString}, function(err, season) {
                if(err) return next(err);
                if(!season) {
                    var startNext = date.parse(result.treasury.meta.start, 'DD.MM.YYYY');
                    startNext.setDate(startNext.getDate()+28);
                    var nextEndString = date.format(startNext, 'DD.MM.YYYY');
                    var nextSeason = new Season({start: nextStartString, end: nextEndString, next: true, clan: result.treasury.meta.clanid});
                    nextSeason.save(function(err) { if(err) return next(err); });
                    Clan.updateOne({ _id: result.treasury.meta.clanid}, { $push: { seasons: nextSeason._id } }, function(err) {  if(err) return next(err); });
                }
            });

            var equitIds = new Array();
            async.series([
                function(callback) {
                    // add equitment
                    if(result.treasury.equitment) {
                        for(var i=0; i < result.treasury.equitment.length; i++) {
                            var equitmentJson = result.treasury.equitment[i];
                            var equitment = new Equitment(equitmentJson);
                            equitIds.push(equitment._id);
                            equitment.seasonId = season._id;
                            
                            equitment.save(function(err) { if(err) return next(err); });
                        }
                    }
                    // add usable
                    if(result.treasury.usable) {
                        for(var i=0; i < result.treasury.usable.length; i++) {
                            var usableJson = result.treasury.usable[i];
                            var id = Buffer.from(usableJson.name).toString('base64').substr(0, 24);
                            var equitment = new Equitment(usableJson);
                            equitIds.push(equitment._id);
                            if(usableJson.$ && usableJson.$.count) {
                                var count = parseInt(usableJson.$.count);
                                equitment.count = count;
                            }
                            equitment.save(function(err) { if(err) return next(err); });
                        }
                    }
                    callback(null);
                }, 
                function(callback) {
                    season.equitment = equitIds;
                    season.save(function(err) { if(err) return next(err); });
                    Clan.updateOne({ _id: result.treasury.meta.clanid}, { $push: { seasons: season._id } }, function(err) { if(err) return next(err); });
                    callback(null);
                }
            ]);
        });
        
    });
    return res.redirect('/treasury');
}