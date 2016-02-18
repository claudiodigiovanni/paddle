var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var bookingSchema = new Schema({
  callToAction: Boolean,
  circolo: { type: Schema.Types.ObjectId, ref: 'Circolo' },
  court: Number,
  date: Date,
  gameType: Number,
  note: String,
  payed: Boolean,
  playersNumber: Number,
  ranges: [Number],
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  players: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startHour: Date,
  endHour: Date,
  created_at: Date,
  updated_at: Date
});



var Booking = mongoose.model('Booking', bookingSchema);



// make this available to our users in our Node applications
module.exports = Booking;
