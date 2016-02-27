// grab the things we need
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Circolo = require('./circolo.js');
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




// the schema is useless so far
// we need to create a model using it
var Installation = mongoose.model('Installation', installationSchema);

var objects = {
	installationSchema : installationSchema,
	Installation : Installation
}

// make this available to our users in our Node applications
module.exports = objects;
