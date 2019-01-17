const sortMap = require('sort-map')
var Season = require('../models/season');
var HCPlayer = require('../models/hcplayer');
var Selection = require('../models/selection');

const pushEqToIdStack = function(equitment, array) {
    if(!equitment || array.includes(equitment._id.toString())) return;
    for(var i=0; i < equitment.count; i++) {
        array.push(equitment._id.toString())
    }
}
const remove = function(element, array) {
    var index = array.indexOf(element);
    //console.log('Remove from ' + JSON.stringify(array));
    if(index > -1) {
        array.splice(index,1);
        //console.log('Remove ' + element);
        return true;
    }  else {
        //console.log('Not found ' + element);
        return false;
    }
}

const compareGlory = function(u1, u2) {
    if(u1.glory > u2.glory) return -1;
    if(u1.glory < u2.glory) return 1;
    return 0;
} 

exports.edit = function(req, res, next) {
    console.log('edit season ' + req.params.id);
    var hcplayer = new HCPlayer(req.session.hcplayer);
    var season = Season.findById(req.params.id).populate('equitment');
    season.exec(function(err, season) {
        if(err) return next(err);
        return res.render('editseason', {data: season, treasurer: hcplayer.treasurer, origin: { treasury : true } });
    })
}

exports.select = function(req, res, next) {

    var clanId = req.body.clan;
    var selectedId = req.body.seasonradio;

    Season.findOne({clan: clanId, current: true}, function(err, currentSeason) {
        if(err) return next(err);
        Season.updateOne({_id: currentSeason._id}, {current: false}, function(err) { 
            if(err) return next(err);
        });
        Season.updateOne({_id: selectedId }, {current: true}, function(err) {
            if(err) return next(err);
        });
        HCPlayer.find(function(err, hcplayers) {
            if(err) return next(err);
            hcplayers.forEach(function(player, idx, hcplayers) {
                Selection.findOne({ hcplayer: player._id, season: selectedId }, function(err, selection) {
                    if(err) return next(err);
                    var update = {};
                    if(selection) {
                        update.selection = selection._id;
                        update.registert = true;
                        update.glory     = 0;
                    } else {
                        update.selection = undefined;
                        update.registert = false;
                        update.glory     = 0;
                    }
                    HCPlayer.update({_id: player._id}, update, function(err) { if(err) return next(err); });
                });
            });
        });
    });
    return res.redirect('/treasury');
}
 
exports.distribute = function(req, res, next) {

    var seasonQuery = Season.findById(req.params.id).populate('equitment');

    seasonQuery.exec(function(err, season) {
        if(err) return next(err);

        var query = HCPlayer.find({clan: season.clan})
                            .sort({glory: -1})
                            .populate({ path: 'selection', model: 'Selection', populate: { path: 'first second third', model: 'Equitment'}});

        query.exec(function(err, players) {
            if(err) return next(err);
            //if(!players) return next();
            console.log('distribute called.' + players);

            var result = new Array();
            result.distribution = new Map();
            result.playersNotQualified = new Map();
            result.playersOpen = new Array();
            result.season = new Array();

            result.season.start = season.start;
            result.season.end = season.end;

            var equitmentOpen = new Array();
            for(var eq of season.equitment) {
                //console.log('EQ' + eq);
                if(eq) pushEqToIdStack(eq, equitmentOpen);
            }

            for(var player of players) {
                //console.log('dist for player ' + player.username);
                var selection = player.selection;
                //player has no selection
                if(!selection) {
                    console.log(player.username + ': no selection for player.');
                    result.playersNotQualified.set(player.username.toString(), 'Keine Auswahl');
                    continue;
                }
                //player selection is old
                if(selection.season.toString() != req.params.id) {
                    console.log(player.username + ': selection not from current season.');
                    result.playersNotQualified.set(player.username.toString(), 'Auswahl passt nicht zur aktuellen Saison');
                    continue;
                }
                //player has not enougth glory 
                var notQualified = player.minGlory > player.glory;
                if(notQualified) {
                    console.log(player.username + ': not enougth glory for distribution.');
                    result.playersNotQualified.set(player.username.toString(), 'Er Mindesruhm wurde nicht erreicht');
                    continue;
                }                
                if(selection.first && equitmentOpen.includes(selection.first._id.toString())) {
                    console.log(player.username + ': distribute ' + selection.first.name);
                    remove(selection.first._id.toString(), equitmentOpen);
                    result.distribution.set(player.username, selection.first);
                    continue;
                }
                if(selection.second && equitmentOpen.includes(selection.second._id.toString())) {
                    console.log(player.username + ': distribute ' + selection.second.name);
                    remove(selection.second._id.toString(), equitmentOpen);
                    result.distribution.set(player.username, selection.second);
                    continue;
                }
                if(selection.third && equitmentOpen.includes(selection.third._id.toString())) {
                    console.log(player.username + ': distribute ' + selection.third.name);
                    remove(selection.third._id.toString(), equitmentOpen);
                    result.distribution.set(player.username, selection.third);
                    continue;
                }
                console.log(player.username + ': no selection made');
                result.playersOpen.push(player);
            }
            result.equitmentOpen = new Array();
            for(var eq of season.equitment) {
                if(equitmentOpen.includes(eq._id.toString())) result.equitmentOpen.push(eq);
            }
            var hcplayer = new HCPlayer(req.session.hcplayer);
            return res.render('distribution', {data: result, treasurer: hcplayer.treasurer, origin: { treasury : true } })
        });
    });
}
