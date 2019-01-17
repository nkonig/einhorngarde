var Clan          = require('../models/clan');
var HCPlayer      = require('../models/hcplayer');
var Participation = require('../models/participation');
var Season        = require('../models/season');
var date          = require('date-and-time');

exports.index = function(req, res, next) {
    var query = req.params.clanid ? {_id: req.params.clanid} : {};
    var clanQuery = Clan.findOne(query).populate({ path: 'seasons', model: 'Season' });
    clanQuery.exec(function(err, clan) {
        if(err) return next(err);
        var currSeason = {};
        clan.seasons.forEach(function(season) {
            if(season.next) {
                currSeason = season;
            }
        })
        currSeason.startformated = date.format(date.parse(currSeason.start, 'DD.MM.YYYY'), 'YYYY-MM-DD');
        currSeason.endformated   = date.format(date.parse(currSeason.end  , 'DD.MM.YYYY'), 'YYYY-MM-DD');
        currSeason.todayformated = date.format(new Date()                                , 'YYYY-MM-DD')

        var participationQuery = Participation.find({season: currSeason})
                                              .populate({ path: 'user', model: 'HCPlayer'});
        participationQuery.exec(function(err, participations) {
            if(err) return next(err);
            if(!participations || participations.length == 0) {
                HCPlayer.find({clan: currSeason.clan}, function(err, users) {
                    if(err) return next(err);
                    Clan.find(function(err, clans) {
                        if(err) return next(err);
                        return res.render('warroom', { data: {}, header: {}, season: currSeason, users: users, clans: clans, treasurer: true, origin: { users : true } }); 
                    });
                });
                return;
            }
            var header = new Array();
            for(var i = 0; i < 14; i++) {
                var dayIterator = date.parse(currSeason.start, 'DD.MM.YYYY');
                dayIterator.setDate(dayIterator.getDate()+i);
                header.push({ day: date.format(dayIterator, 'DD.MM.YYYY')});
                if(dayIterator.getTime() == new Date().getTime()) break;
            }
            participations.sort(function(part1, part2) {
                if(part1.sum > part2.sum ) return -1;
                if(part1.sum < part2.sum ) return 1;
                return 0;
            });
            participations.forEach(function(part, idx, array) {
                participations[idx].participation = new Map([part.participation.keys()].sort(function(k1, k2) {
                    var date1 = date.parse(k1, 'YYYY-MM-DD');
                    var date2 = date.parse(k2, 'YYYY-MM-DD');
                    if(date1 > date2) return -1;
                    if(date1 < date2) return 1;
                    return 0;
                }));
            });
            HCPlayer.find({clan: currSeason.clan}, function(err, users) {
                if(err) return next(err);
                Clan.find(function(err, clans) {
                    if(err) return next(err);
                    return res.render('warroom', { data: participations, header: header, season: currSeason, users: users, clans: clans, treasurer: true, origin: { users : true } });            
                });
            });
        });
        
    });
}

exports.add = function(req, res, next) {
    var daySel  = req.body.ckday; //date.format(date.parse(req.body.ckday, 'YYYY-MM-DD'), 'DD.MM.YYYY');
    var hourSel = req.body.ckhour;
    var players = req.body.participantlist;
    var clan    = req.body.clan;
    Season.findOne({next: true, clan: clan}, function(err, season) {
        if(err) return next(err);
        players = players.length ? players : new Array(players);
        players.forEach(function(playerid) {
            console.log('playerid ' + playerid);
            Participation.findOne({season: season._id, user: playerid}, function(err, participation) {
                if(err) return next(err);
                var part = participation ? participation : new Participation({user: playerid, season: season._id});
                var day  = part.participation && part.participation.has(daySel) ? part.participation.get(daySel) : { };
                switch(hourSel) {
                    case '04:00':
                        day.first = true;
                        break;
                    case '11:00':
                        day.second = true;
                        break;
                    case '16:00':
                        day.third = true;
                        break;
                    case '22:00':
                        day.fourth = true;
                        break;
                    default:
                }
                console.log(day);
                if(!part.participation) {
                    part.participation = new Map();
                    var dayIterator = date.parse(season.start, 'DD.MM.YYYY');
                    var selectedDay = new Date(daySel);
                    var missingOldDays = (selectedDay.getTime() > dayIterator.getTime());
                    while(missingOldDays) {
                        if(part.participation.has(date.format(dayIterator, 'YYYY-MM-DD'))) {
                            dayIterator.setDate(dayIterator.getDate()+1);
                            missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                            continue;
                        }
                        part.participation.set(date.format(dayIterator, 'YYYY-MM-DD'), {} );
                        dayIterator.setDate(dayIterator.getDate()+1);
                        missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                    }
                }
                part.participation.set(daySel, day);
                part.save(function(err) { if(err) console.error(err) });
            });
        });
        /*
        Participation.find({season: season._id}, function(err, participations) {
            if(err) return next(err);
            if(participations && participations.length > 0) {
                participations.forEach(function(part) {
                    var dayIterator = date.parse(season.start, 'DD.MM.YYYY');
                    var selectedDay = new Date(daySel);
                    var missingOldDays = (selectedDay.getTime() > dayIterator.getTime());
                    while(missingOldDays) {
                        if(part.participation.has(date.format(dayIterator, 'YYYY-MM-DD'))) {
                            dayIterator.setDate(dayIterator.getDate()+1);
                            missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                            continue;
                        }
                        part.participation.set(date.format(dayIterator, 'YYYY-MM-DD'), {} );
                        dayIterator.setDate(dayIterator.getDate()+1);
                        missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                    }
                    var newPart  = part.participation.has(daySel) ? part.participation.get(daySel) : { } ;
                    var tookPart = players.includes(part.user);
                    console.log('took part: ' + tookPart);
                    switch(hourSel) {
                        case '04:00':
                            newPart.first = tookPart || newPart.first;
                            break;
                        case '11:00':
                            newPart.second = tookPart || newPart.second;
                            break;
                        case '16:00':
                            //console.log(tookPart + ' || ' + newPart.third + ' = ' + tookPart || newPart.third);
                            newPart.third = tookPart || newPart.third;
                            break;
                        case '20:00':
                            newPart.fourth = tookPart || newPart.fourth;
                            break;
                        default:
                    }
                    part.participation.set(daySel, newPart);
                    //console.log(part.participation);
                    Participation.updateOne({_id: part._id}, { participation: part.participation }, function(err) { if(err) return next(err); });
                });
            } else {
                HCPlayer.find({clan: season.clan}, function(err, users) {
                    if(err) return next(err);
                    users.forEach(function(user) {
                        var dayIterator = date.parse(season.start, 'DD.MM.YYYY');
                        var selectedDay = new Date(daySel);
                        var participation = new Participation({ user: user._id, season: season._id});
                        participation.participation = new Map();
                        var missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                        while(missingOldDays) {
                            participation.participation.set(date.format(dayIterator, 'YYYY-MM-DD'), {} );
                            dayIterator.setDate(dayIterator.getDate()+1);
                            missingOldDays = selectedDay.getTime() > dayIterator.getTime();
                        }
                        var newPart = {};
                        var tookPart = players.includes(user._id.toString());
                        switch(hourSel) {
                            case '04:00':
                                newPart.first = tookPart;
                                break;
                            case '11:00':
                                newPart.second = tookPart;
                                break;
                            case '16:00':
                                newPart.third = tookPart;
                                break;
                            case '20:00':
                                newPart.fourth = tookPart;
                                break;
                            default:
                        }
                        participation.participation.set(daySel, newPart);
                        participation.save(function(err) { if(err) console.error(err) });
                    });
                });
            }
        });
        */
    });
    res.redirect('/users');
}