

exports.index = function(req, res, next) {
    return res.render('editclan', { origin: { treasury : true } });    
}

exports.add = function(req, res, next) {

}