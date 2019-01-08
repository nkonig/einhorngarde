var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipationSchema = new Schema({
    day : String,
    participation: {
        type: Map,
        of: String
      }
});

module.exports = mongoose.model('Participation', ParticipationSchema);