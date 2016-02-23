
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var paymentSchema = new Schema({
  circolo: { type: Schema.Types.ObjectId, ref: 'Circolo' },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  qty: Number,
  type: String,
  created_at: Date,
  updated_at: Date
});


paymentSchema.pre('save', function (next) {
  
  var payment = this;
  var currentDate = new Date();
  // change the updated_at field to current date
  payment.updated_at = currentDate;
	if (payment.isNew){
		payment.created_at = currentDate
	}
})

var Payment = mongoose.model('Payment', paymentSchema);

// make this available to our users in our Node applications
module.exports = Payment;
