var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'HCPlayer' },
    season: {type: Schema.Types.ObjectId, ref: 'Season'},
    participation: {
        type: Map,
        of: {
            first:  { type: Boolean, default: false},
            second: { type: Boolean, default: false},
            third:  { type: Boolean, default: false},
            fourth: { type: Boolean, default: false},
        }
      } 
});

ParticipationSchema.virtual('sum').get(function() {
    var count = 0;
    this.participation.forEach(function(value, day, map) {
        if(value.first) count++;
        if(value.second) count++;
        if(value.third) count++;
        if(value.fourth) count++;
    });
    return count;
})


module.exports = mongoose.model('Participation', ParticipationSchema);