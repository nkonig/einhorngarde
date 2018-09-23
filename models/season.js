var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SeasonSchema = new Schema({
    equitment : [{ type: Schema.Types.ObjectId, ref: 'Equitment'}],
    start: String,
    end: String,
    current: { type: Boolean, default: false }
});

/*SeasonSchema.virtual('number').get(function() {

})*/

module.exports = mongoose.model('Season', SeasonSchema);