var mongoose = require('mongoose'); 

var Schema = mongoose.Schema;

var ClanSchema = new Schema({
    main     : { type: Boolean, default: false },
    name     : String,
    members  : [{ type: Schema.Types.ObjectId, ref: 'HCPlayer' }],
    seasons  : [{ type: Schema.Types.ObjectId, ref: 'Season' }]
});

module.exports = mongoose.model('Clan', ClanSchema);