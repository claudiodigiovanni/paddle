var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var invitationSchema = new Schema({
  callToAction: Boolean,
  circolo: { type: Schema.Types.ObjectId, ref: 'Circolo' },
  court: Number,
  date: Date,
  gameType: Number,
  note: String,
  payed: Boolean,
  playersNumber: Number,
  ranges: [Number],
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  updated_at: Date
});

var Invitation = mongoose.model('Invitation', invitationSchema);

// make this available to our users in our Node applications
module.exports = Invitation;

