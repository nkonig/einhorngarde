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
console.log('Remove from ' + JSON.stringify(array));
if(index > -1) {
    array.splice(index,1);
    console.log('Remove ' + element);
    return true;
}  else {
    console.log('Not found ' + element);
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
    Season.findOne({current: true}, function(err, currentSeason) {
        if(err) return next(err);
        Season.updateOne({_id: currentSeason._id}, {current: false}, function(err) { 
            if(err) return next(err);
        });
        var selectedId = req.body.seasonradio;
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
    var query = Selection.find({season: req.params.id})
                         .populate('first second third')
                         .populate({ path: 'hcplayer' , populate: { path: 'selection', model: 'Selection', populate: { path: 'first second third', model: 'Equitment'}}})
                         .populate({ path: 'season', populate: { path:  'equitment', model: 'Equitment'}});
    query.exec(function(err, selections) {
        if(err) return next(err);

        if(!selections) return res.redirect('/treasury');
    
        var result = new Array();
        var playerUnsorted = new Map();
        var equitmentOpen = new Array();
        var first = new Array();
        var second = new Array();
        var third = new Array();

        result.season = new Array();
        result.season.start = selections[0].season.start;
        result.season.end = selections[0].season.end;

        for(var i = 0; i < selections[0].season.equitment.length; i++) {
            var eq = selections[0].season.equitment[i];
            if(eq) pushEqToIdStack(eq, equitmentOpen);
        }

        for(var i = 0; i < selections.length; i++) {
            //if(selections[i].hcplayer == null || selections[i].hcplayer.username === 'Darka') console.log(selections[i]);
            if(!selections[i].hcplayer) continue;
            var current = selections[i].hcplayer;
            if(!current.selection) continue;
            //console.log('SELECTION ID: ' + selections[i]._id);
            playerUnsorted.set(current._id, current);
            pushEqToIdStack(current.selection.first, first);
            pushEqToIdStack(current.selection.second, second);
            pushEqToIdStack(current.selection.third, third);
        }
        

        //console.log('First: ' + JSON.stringify(first));
        //console.log('Second: ' + JSON.stringify(second));
        //console.log('Third: ' + JSON.stringify(third));
        //console.log('Unsorted: ')
        //playerUnsorted.forEach(function(user, id, players) { console.log('SELECTION USER: ' + user.glory + ' ' + user.username) });
        
        //console.log('Sorted: ');
        //players.forEach(function(user, id, players) { console.log('SELECTION USER: ' + user.glory + ' ' + user.username) });
        var playersOpen = new Array();
        var players = sortMap(playerUnsorted, ([k1, v1], [k2, v2]) => compareGlory(v1, v2));
        var dist = new Map();
        //distribute first
        for(var [key, player] of players) {
            playersOpen.push(player.username.toString());
            if(first.includes(player.selection.first._id.toString())) {
                dist.set(player.username + ' (' + player.glory + ')', player.selection.first);
                //console.log('First dist: ' + player.username + ' (' + player.glory + ')', player.selection.first._id);
                remove(player.selection.first._id.toString(), first);
                remove(player.selection.first._id.toString(), second);
                remove(player.selection.first._id.toString(), third);
                remove(player.selection.first._id.toString(), equitmentOpen);
                remove(player.username.toString(), playersOpen);
            }
        }
        
        //distribute second
        for(var [glory, player] of players) {
            if(second.length == 0 || playersOpen.length == 0) break;
            if(!playersOpen.includes(player.username.toString())) continue;
            if(second.includes(player.selection.second._id.toString())) {
                dist.set(player.username + ' (' + player.glory + ')', player.selection.second);
                //console.log('Second dist: ' + player.username + ' (' + player.glory + ')', player.selection.second._id);
                remove(player.selection.second._id.toString(), second);
                remove(player.selection.second._id.toString(), third);
                remove(player.selection.second._id.toString(), equitmentOpen);
                remove(player.username.toString(), playersOpen);
            }
        }

        //distribute third
        for(var [glory, player] of players) {
            if(third.length == 0 || playersOpen.length == 0) break;
            if(!playersOpen.includes(player.username.toString())) continue;
            if(third.includes(player.selection.third._id.toString())) {
                dist.set(player.username + ' (' + player.glory + ')', player.selection.third);
                //console.log('Third dist: ' + player.username + ' (' + player.glory + ')', player.selection.third._id);
                remove(player.selection.third._id.toString(), third);
                remove(player.selection.third._id.toString(), equitmentOpen);
                remove(player.username.toString(), playersOpen);
            }
        }
        var hcplayer = new HCPlayer(req.session.hcplayer);
        result.player = new Array();
        dist.forEach(function(equitment, name, dist) {
            result.player.push({username: name, equitment: equitment});
        });
        result.playersOpen = new Array();
        for(var i = 0; i < playersOpen.length;i++) {
            result.playersOpen.push({username: playersOpen[i]});
        }
        result.equitmentOpen = new Array();
        for(var i = 0; i < selections[0].season.equitment.length; i++) {
            var eq = selections[0].season.equitment[i];
            if(equitmentOpen.includes(eq._id.toString())) result.equitmentOpen.push(eq);
        }
        console.log(result);
        return res.render('distribution', {data: result, treasurer: hcplayer.treasurer, origin: { treasury : true } })
    });
}
