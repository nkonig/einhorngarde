var HCPlayer = require('../models/hcplayer');
var Selection = require('../models/selection');
var Season = require('../models/season');
var Clan      = require('../models/clan');

exports.index = function(req, res, next) {
    var user = new HCPlayer(req.session.hcplayer); 
    var query = {};
    if(!user.treasurer) {
        query.registert = true;
        query.clan = user.clan;
    }
    if(req.params.filter) {
        var filter = req.params.filter.split('$$');
        for(idx in filter) {
            var field = filter[idx].split("=")[0];
            var value = filter[idx].split("=")[1];
            switch(field) {
                case 'throneroom':
                    query.throneroom = value;
                    break;
                case 'username':
                    query.username = new RegExp(value, 'i');
                    break;
                case 'clan':
                    query.clan = value;
                    break;
                default:
            }
        }
    }    
    HCPlayer.find(query)
            .sort({glory: -1})
            .select('username glory selection rank throneroom registert clan')
            .populate({path: 'selection' , populate: { path: 'first second third', model: 'Equitment'}})
            .populate({path: 'clan', model: 'Clan'})
            .exec(function(err, result) {
                if(err) console.error(err);
                //console.log('FOUND: ' +result);
                
                var raw = new Array();    
                for(var i = 0; i < result.length; i++) {
                    var value = result[i];
                    if(result[i].minGlory > result[i].glory) {
                        value.notAuthorized = true;
                    }
                    if(user.username === result[i].username) {
                        user = result[i];
                        //delete result[i];                                    
                        //return res.render('users', {data: result, user: user, treasurer: user.treasurer, origin: { users : true }});
                    }
                    raw.push(value);
                }
                Clan.find({}, function(err, clans) {
                    if(err) console.error(err);
                    return res.render('users', {data: raw, clans: clans, clanfilter: query.clan, user: user, treasurer: user.treasurer, origin: { users : true }});
                });
            });
}

exports.add = function(req, res, next) {

    var hcplayer = new HCPlayer({username: req.body.username, rank: req.body.rolle, password: 'einhorngarde123!'});

    hcplayer.save(function(err) {
        if(err) console.error(err);
    });

    return res.redirect('/treasury');
}

exports.edit = function(req, res, next) {
    var hcplayer = new HCPlayer(req.session.hcplayer); 
    var newUser = req.params.id === 'new';
    if(newUser) {
        var user = new HCPlayer({username: '', password: 'einhorngarde123!'});
        var options = {exists: false};
        Clan.find({}, function(err, clans) {
            if(err) return next(err);
            return res.render('edituser', {user: user, clans: clans, treasurer: hcplayer.treasurer, options: options, origin: { users : true }});
        });
    } else {
        var query = HCPlayer.findById(req.params.id).populate({path: 'selection', populate: { path: 'first second third', model: 'Equitment'}});
        query.exec(function(err, user, next) {
            if(err) return next(err);
            var options = {exists: true};
            options.rank = hcplayer.rank;
            var selection = {};
            if(user.selection) {
                if(user.selection.first) selection.first = user.selection.first._id;
                if(user.selection.second) selection.second = user.selection.second._id;
                if(user.selection.third) selection.third = user.selection.third._id;
            }
            var clanQuery = Clan.find({}).populate({ path: 'seasons', populate: { path: 'equitment', model: 'Equitment'}});
            clanQuery.exec(function(err, clans, next) {
                if(err) return next(err);
                if(user.clan) {
                    clans.forEach(function(clan) {
                        if(clan._id.toString() == user.clan.toString()) {
                            clan.seasons.forEach(function(season) {
                                if(season.current) {
                                selection.eqs = season.equitment;
                                }
                            })
                        }
                    });
                } else {
                    selection.eqs = {};
                }                 
                return res.render('edituser', {user: user, clans: clans, selection: selection, treasurer: hcplayer.treasurer, options: options,  origin: { users : true }});
            });
        });
    }
}

exports.save = function(req, res, next) {
    var firstSel = req.body.first === 'none' ? undefined :  req.body.first;
    var secondSel = req.body.second === 'none' ? undefined :  req.body.second;
    var thirdSel = req.body.third === 'none' ? undefined :  req.body.third;
    var noSel =!firstSel && !secondSel && !thirdSel; 
    var newUser = req.body.exists === 'false';
    
    if(!newUser) {
        HCPlayer.update({_id: req.body.userid}, {
                                                    rank: req.body.rank,
                                                    throneroom: req.body.throneroom,
                                                    glory: req.body.glory,
                                                    clan:  req.body.clan
                                                }, function(err) { if(err) console.error(err); });

        if(!noSel) {
            Season.findOne({current: true}, function(err, season) {
                if(err) console.error(err);
                var findSel = Selection.findOne({hcplayer: req.body.userid, season: season._id});
                findSel.exec(function(err, sel) {
                    if(err) console.error(err);
                    if(sel) {
                        Selection.updateOne({_id: sel._id},
                                            {
                                                first: firstSel,
                                                second: secondSel,
                                                third: thirdSel
                                            }, 
                                            function(err) { if(err) console.error(err) });
                    } else {
                        var selection = new Selection({
                            hcplayer: req.body.userid,
                            first: firstSel,
                            interest: 'need',
                            second: secondSel,
                            third: thirdSel,
                            season: season._id
                        });
                        selection.save(function(err) { if(err) console.error(err) });
                        HCPlayer.updateOne({ _id: req.body.userid }, { selection: selection._id }, function(err) { if(err) console.error(err) });
                    }
                })
            });
        } else {
            HCPlayer.findByIdAndUpdate(req.body.userid, { selection: null, rank: req.body.rank, throneroom: req.body.throneroom, glory: req.body.glory, clan: req.body.clan }, function(err, player) { 
                if(err) console.error(err);
                if(player.selection) {
                    Selection.deleteOne({ _id: player.selection}, function(err) { if(err) console.error(err) });
                } 
            });
        }
    } else {
        if(!noSel) {
            Season.findOne({current: true}, function(err, season) {
                if(err) console.error(err);
                var selection = new Selection({
                    hcplayer: req.body.userid,
                    first: firstSel,
                    interest: 'need',
                    second: secondSel,
                    third: thirdSel,
                    season: season._id
                });
                selection.save(function(err) {
                        if(err) console.error(err);
                        //console.log('Selection added ' + selection._id);
                });

                var hcplayer = new HCPlayer({
                    username: req.body.name,
                    rank: req.body.rank,
                    throneroom: req.body.throneroom,
                    glory: req.body.glory,
                    password: 'einhorngarde123!',
                    selection: selection._id,
                    clan: req.body.clan
                });
                hcplayer.save(function(err) { if(err) console.error(err); });
            });
        } else {
            var hcplayer = new HCPlayer({
                username: req.body.name,
                rank: req.body.rank,
                throneroom: req.body.throneroom,
                glory: req.body.glory,
                password: 'einhorngarde123!',
                clan: req.body.clan
            });
            hcplayer.save(function(err) { if(err) console.error(err); });
        }
    }
    return res.redirect('/users');
}

exports.delete = function(req, res, next) {
    HCPlayer.deleteOne({_id: req.params.id}, function(err) {
            if(err) console.error(err);
            var deleteSelections = Selection.deleteMany({hcplayer: req.params.id});
            deleteSelections.exec(function(err) {
                if(err) console.error(err);
                console.log('User deleted ' + req.params.id);
                return res.redirect('/users/');
            })
    });
}

exports.resetPassword = function(req, res, next) {
    HCPlayer.findById(req.params.id, function(err, user) {
        if(err) console.error(err);
        if(user) {
            user.password = 'einhorngarde123!';
            user.registert = false;
            user.save(function(err) { if(err) console.error(err)});
            console.log('Passwort for user ' + user.username + ' reseted');
        }
        return res.redirect('/users');
    });
}
 
exports.editglory = function(req, res, next) {
    console.log('TEST');
    var query = HCPlayer.find({}).select('username glory');
    query.exec(function(err, players) {
        if(err) console.error(err);
        var hcplayer = new HCPlayer(req.session.hcplayer); 
        return res.redirect('/selection', {data: players, treasurer: hcplayer.treasurer, origin: { users : true }});
    });
}

exports.saveallglory = function(req, res, next) {

}