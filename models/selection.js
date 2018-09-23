var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SelectionSchema = new Schema({
    hcplayer : { type: Schema.Types.ObjectId, ref: 'HCPlayer' },
    first    : { type: Schema.Types.ObjectId, ref: 'Equitment' },
    interest : { type: String, required: true, enum: ['need', 'greed'] },
    second   : { type: Schema.Types.ObjectId, ref: 'Equitment' },
    third    : { type: Schema.Types.ObjectId, ref: 'Equitment' },
    season   : { type: Schema.Types.ObjectId, ref: 'Season' },
});

module.exports = mongoose.model('Selection', SelectionSchema);