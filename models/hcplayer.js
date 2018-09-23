var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt');
var constants = require('../middelware/constants');

var Schema = mongoose.Schema;

var HCPlayerSchema = new Schema({
    username    : { type: String, unique: true, required: true, trim: true }, 
    password    : { type: String, required: true },
    rank        : { type: String, enum: ['Soldat', 'Offizier', 'Schatzmeister', 'Stellvertreter', 'BigBoss'], default: 'Soldat' },
    throneroom  : { type: Number, min: 5, max: 10 },
    selection   : { type: Schema.Types.ObjectId, ref: 'Selection' },
    glory       : Number,
    registert   : { type: Boolean, default: false}
});

//hashing a password before saving it to the database
HCPlayerSchema.pre('save', function (next) {
    var user = this;
    console.log('hash password');
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });

HCPlayerSchema.virtual('maxLevel').get(function() {
  switch(this.throneroom) {
    case 5:
      return constants.MAX_LEVEL_FIGHTER_5;
    case 6:
      return constants.MAX_LEVEL_FIGHTER_6;
    case 7:
      return constants.MAX_LEVEL_FIGHTER_7;
    case 8:
      return constants.MAX_LEVEL_FIGHTER_8;
    case 9:
      return constants.MAX_LEVEL_FIGHTER_9;
    case 10:
      return constants.MAX_LEVEL_FIGHTER_10;
    default:
      return 0;
  }
})

HCPlayerSchema.virtual('treasurer').get(function() {
  return (this.rank === 'Schatzmeister' ||  this.rank === 'Stellvertreter' ||  this.rank === 'BigBoss');
})

module.exports = mongoose.model('HCPlayer', HCPlayerSchema);