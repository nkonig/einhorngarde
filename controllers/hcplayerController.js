var HCPlayer = require('../models/hcplayer');
var Selection = require('../models/selection');
var Season = require('../models/season');

exports.index = function(req, res, next) {
    HCPlayer.find({registert: true})
                       .limit(20)
                       .sort({glory: -1})
                       .select('username glory selection rank throneroom')
                       .populate({path: 'selection' , populate: { path: 'first second third', model: 'Equitment'}})
                       .exec(function(err, result) {
                           if(err) return next(err);
                           //console.log('FOUND: ' +result);

                            var user = new HCPlayer(req.session.hcplayer); 
                             
                            for(var i = 0; i < result.length; i++) {
                                if(user.username === result[i].username) {
                                    user = result[i];
                                    //delete result[i];                                    
                                    return res.render('users', {data: result, user: user, treasurer: user.treasurer, origin: { users : true }});
                                }
                            }
                            result.push(user);
                            return res.render('users', {data: result, user: user, treasurer: user.treasurer, origin: { users : true }});
                        });
}

exports.add = function(req, res, next) {
    //if(err) return handleError(err);
    console.log('username: ' + req.body.username);
    console.log('rolle: '    + req.body.rolle);

    var hcplayer = new HCPlayer({username: req.body.username, rank: req.body.rolle, password: 'einhorngarde123!'});

    hcplayer.save(function(err) {
        if(err) return next(err);
    });

    res.redirect('/treasury');
}

exports.edit = function(req, res, next) {
    var hcplayer = new HCPlayer(req.session.hcplayer); 
    console.log(req.params.id);
    console.log(req.params.id === 'new');
    var newUser = req.params.id === 'new';
    if(newUser) {
        var user = new HCPlayer({username: '', password: 'einhorngarde123!'});
        var options = {exists: false};
        return res.render('edituser', {user: user, treasurer: hcplayer.treasurer, options: options, origin: { users : true }});
    } else {
        var query = HCPlayer.findById(req.params.id).populate({path: 'selection', populate: { path: 'first second third', model: 'Equitment'}});
        query.exec(function(err, user, next) {
            if(err) return next(err);
            var options = {exists: true};
            var selection = {};
            selection.first = user.selection.first._id;
            selection.second = user.selection.second._id;
            selection.third = user.selection.third._id;
            var findEq = Season.findOne({current: true}).populate('equitment', 'name level');
            findEq.exec(function(err, season, next) {
                if(err) return next(err);
                selection.eqs = new Array();
                for(var i=0; i < season.equitment.length; i++) {
                    selection.eqs.push(season.equitment[i]);
                }
                console.log(selection);
                return res.render('edituser', {user: user, selection: selection, treasurer: hcplayer.treasurer, options: options,  origin: { users : true }});
            });
        });
    }
}

exports.save = function(req, res, next) {
    console.log(req.body.exists + ' ' + req.body.userid);
    console.log(req.body.exists);
    var newUser = req.body.exists === 'false';
    if(!newUser) {
        console.log('User updatet ' + req.body.userid);
        console.log('User first: ' +  req.body.first + ' | second: ' +  req.body.second + ' | third: ' +  req.body.third);
        HCPlayer.update({_id: req.body.userid}, {
                                                rank: req.body.rank,
                                                throneroom: req.body.throneroom,
                                                glory: req.body.glory
                                            },
            function(err) {
                if(err) return next(err);
                console.log('User updatet ' + req.body.userid);
        });
        Season.findOne({current: true}, function(err, season) {
            if(err) return next(err);
            var findSel = Selection.findOne({hcplayer: req.body.userid, season: season._id});
            findSel.exec(function(err, sel) {
                if(err) return next(err);
                if(sel) {
                    Selection.updateOne({_id: sel._id},
                                        {
                                            first: req.body.first,
                                            second: req.body.second,
                                            third: req.body.third
                                        }, 
                                        function(err) { if(err) return next(err) });
                } else {
                    var selection = new Selection({
                        hcplayer: req.body.userid,
                        first: req.body.first,
                        interest: 'need',
                        second: req.body.second,
                        third: req.body.third,
                        season: season._id
                    });
                    selection.save(function(err) { if(err) return next(err) })
                }
            })
        });

    } else {
        var selection = new Selection({
            hcplayer: req.body.userid,
            first: req.body.first,
            interest: 'need',
            second: req.body.second,
            third: req.body.third,
            season: season._id
        });
        selection.save(function(err) {
                if(err) return next(err);
                console.log('Selection added ' + selection._id);
        });
        var hcplayer = new HCPlayer({
            username: req.body.name,
            rank: req.body.rank,
            throneroom: req.body.throneroom,
            glory: req.body.glory,
            password: 'einhorngarde123!',
            selection: selection._id
        });
        hcplayer.save(function(err) {
                if(err) return next(err);
                console.log('User added ' + hcplayer.username);
        });
    }
    return res.redirect('/users/');
}

exports.delete = function(req, res, next) {
    HCPlayer.deleteOne({_id: req.params.id}, function(err) {
            if(err) return next(err);
            var deleteSelections = Selection.deleteMany({hcplayer: req.params.id});
            deleteSelections.exec(function(err) {
                if(err) return next(err);
                console.log('User deleted ' + req.params.id);
                return res.redirect('/users/');
            })
    });
}