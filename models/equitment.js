var mongoose = require('mongoose'); 

var Schema = mongoose.Schema;

var EquitmentSchema = new Schema({
    name     : String,
    rarity   : { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common'},
    level    : Number,
    ability  : String,
    count    : { type: Number, default: 1 },
    seasonId : {type: Schema.Types.ObjectId, ref: 'Season'}
});

module.exports = mongoose.model('Equitment', EquitmentSchema);