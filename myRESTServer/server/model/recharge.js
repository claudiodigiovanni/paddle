var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var rechargeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  qty: Number,
  created_at: Date,
  updated_at: Date
});

var Recharge = mongoose.model('Recharge', rechargeSchema);

// make this available to our users in our Node applications
module.exports = Recharge;
