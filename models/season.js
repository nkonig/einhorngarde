var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SeasonSchema = new Schema({
    equitment : [{ type: Schema.Types.ObjectId, ref: 'Equitment'}],
    start: String,
    end: String,
    current: { type: Boolean, default: false },
    chest: String,
    clan: { type: Schema.Types.ObjectId, ref: 'Clan'},
    participations: [{ type: Schema.Types.ObjectId, ref: 'Participation'}]
});

/*SeasonSchema.virtual('number').get(function() {

})*/

module.exports = mongoose.model('Season', SeasonSchema);