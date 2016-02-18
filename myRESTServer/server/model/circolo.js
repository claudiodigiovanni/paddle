var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var circoloSchema = new Schema({
  gameType1: Schema.Types.Mixed,
  gameType2: Schema.Types.Mixed,
  gameType3: Schema.Types.Mixed,
  logo: String,
  nome: String,
  created_at: Date,
  updated_at: Date
});


/*
circoloSchema.statics.findAll = function(){	
	Circolo.find({}, function(err, circoli) {
	  if (err) throw err;

	  return circoli
	});
}

*/

// the schema is useless so far
// we need to create a model using it
var Circolo = mongoose.model('Circolo', circoloSchema);

// make this available to our users in our Node applications
module.exports = Circolo;
