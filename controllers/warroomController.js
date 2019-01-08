var Clan = require('../models/clan');
var date = require('date-and-time');

exports.index = function(req, res, next) {
    var query = Clan.find()
                    .populate({ path: 'seasons', model: 'Season' });
    query.exec(function(err, clans) {
        if(err) return next(err);
        var currSeason = clans[0].seasons[0];
        currSeason.startformated = date.format(date.parse(currSeason.start, 'DD.MM.YYYY'), 'YYYY-MM-DD');
        currSeason.endformated   = date.format(date.parse(currSeason.end  , 'DD.MM.YYYY'), 'YYYY-MM-DD');
        return res.render('warroom', { season: currSeason, clans: clans, treasurer: true, origin: { treasury : true } });        
    });
}

exports.addStats = function(req, res, next) {

}