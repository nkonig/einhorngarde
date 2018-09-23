var HCPlayer = require('../models/hcplayer');

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
        HCPlayer.findById(req.params.id, function(err, user) {
            if(err) return next(err);;
            var options = {exists: true};
            return res.render('edituser', {user: user, treasurer: hcplayer.treasurer, options: options,  origin: { users : true }});
        });
    }
}

exports.save = function(req, res, next) {
    console.log(req.body.exists + ' ' + req.body.userid);
    console.log(req.body.exists);
    var newUser = req.body.exists === 'false';
    if(!newUser) {
        console.log('User updatet ' + req.body.userid);
        HCPlayer.update({_id: req.body.userid}, {
                                                rank: req.body.rank,
                                                throneroom: req.body.throneroom,
                                                glory: req.body.glory
                                            },
            function(err) {
                if(err) return next(err);
                console.log('User updatet ' + req.body.userid);
        });
    } else {
        var hcplayer = new HCPlayer({
            username: req.body.name,
            rank: req.body.rank,
            throneroom: req.body.throneroom,
            glory: req.body.glory,
            password: 'einhorngarde123!'
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
            console.log('User deleted ' + req.params.id);
            return res.redirect('/users/');
    });
}