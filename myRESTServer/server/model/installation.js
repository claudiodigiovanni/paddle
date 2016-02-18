// grab the things we need
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var installationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  deviceType: String,
  deviceToken: String,
  jwtToken: String,
  created_at: Date,
  updated_at: Date,
  
});



var Installation = mongoose.model('Installation', installationSchema);

// make this available to our users in our Node applications
module.exports = Installation;
