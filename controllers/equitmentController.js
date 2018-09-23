var Equitment = require('../models/equitment');
var Seasion   = require('../models/season');

exports.save = function(req, res, next) {
    var eqId = "";
    if(req.body.exists === "true") {
        eqId = req.body.eqId;
        Equitment.update({_id: req.body.eqid}, {
                                                name: req.body.name,
                                                rarity: req.body.rarity,
                                                level: req.body.level,
                                                ability: req.body.ability
                                            },
            function(err) {
                if(err) return next(err);
                console.log('Equitment updatet ' + req.body.eqid);
        });
    } else {
        var equitment = new Equitment({
            name: req.body.name,
            rarity: req.body.rarity,
            level: req.body.level,
            ability: req.body.ability,
            seasonId: req.body.seasonid
            });
        eqId = equitment._id;
        equitment.save(function(err) {
                if(err) return next(err);
                console.log('Equitment added ' + equitment._id);
        });
    }
    Seasion.update({_id: req.body.seasonid}, {$push: {equitment: eqId} }, function(err) {
        if(err) return next(err);
        return res.redirect('/treasury/season/' + req.body.seasonid + '/edit');
    });
}

exports.delete = function(req, res, next) {
    Equitment.deleteOne({_id: req.params.eqid}, function(err) {
            if(err) return next(err);
            console.log('Equitment deleted ' + req.params.eqid);
            return res.redirect('/treasury/');
    });
}