var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var _ = require('lodash');

// create a schema
var dashboardSchema = new Schema({
  area0: String,
  area1: String,
  area2: String,
  area3: String,
  circolo: { type: Schema.Types.ObjectId, ref: 'Circolo' },
  created_at: Date,
  updated_at: Date
});



var Dashboard = mongoose.model('Dashboard', dashboardSchema);

// make this available to our users in our Node applications
module.exports = Dashboard;


			
			
			