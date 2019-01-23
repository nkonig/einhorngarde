var Clan          = require('../models/clan');
var HCPlayer      = require('../models/hcplayer');
var Participation = require('../models/participation');
var Season        = require('../models/season');
var date          = require('date-and-time');

exports.index = function(req, res, next) {
    var query = req.params.clanid ? {_id: req.params.clanid} : {main: true};
    var clanQuery = Clan.findOne(query).populate({ path: 'seasons', model: 'Season' });
    clanQuery.exec(function(err, clan) {
        if(err) return next(err);
        var currSeason = {};
        clan.seasons.forEach(function(season) {
            if(season.next) {
                currSeason = season;
            }
        });
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
                        return res.render('warroom', { data: {}, header: {}, season: currSeason, users: users, clans: clans, daycount: 0, treasurer: true, origin: { users : true } }); 
                    });
                });
                return;
            }

            var selectedDays = req.query.daycount ? new Number(req.query.daycount)+3 : 0;

            participations.sort(function(part1, part2) {
                if(part1.sum > part2.sum ) return -1;
                if(part1.sum < part2.sum ) return 1;
                return 0;
            });
            var raw = new Array();
            var header = new Array();
            var first = true;
            participations.forEach(function(part) {
                var hcPart = {};
                hcPart.username = part.user.username;
                hcPart.sum      = part.sum;
                var dayIterator = new Date();
                dayIterator.setDate(dayIterator.getDate()-selectedDays); 
                var days = new Array();   
                for(var i = 0; i <= selectedDays; i++) {
                    if(dayIterator < date.parse(currSeason.start, 'DD.MM.YYYY')) {    
                        dayIterator.setDate(dayIterator.getDate()+1);
                        continue;
                    }
                    var dayItKey = date.format(dayIterator, 'YYYY-MM-DD');
                    var day = part.participation.get(dayItKey) ? part.participation.get(dayItKey) : { first: false, second: false, third: false, fourth: false };
                    days.push(day);
                    if(first) { header.push({ day: date.format(dayIterator, 'DD.MM.YYYY')}); }                    
                    dayIterator.setDate(dayIterator.getDate()+1);
                }
                first = false;
                hcPart.days = days;
                raw.push(hcPart);
            });

            HCPlayer.find({clan: currSeason.clan}, function(err, users) {
                if(err) return next(err);
                Clan.find(function(err, clans) {
                    if(err) return next(err);
                    return res.render('warroom', { data: raw, header: header, season: currSeason, users: users, clans: clans, daycount: selectedDays, treasurer: true, origin: { users : true } });            
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
        players = Array.isArray(players) ? players : new Array(players);
        console.log('1: ' + typeof players);
        console.log('2: ' + players);
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
                    case '10:00':
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
    });
    res.redirect('/users');
}