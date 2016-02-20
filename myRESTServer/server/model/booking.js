var mongoose = require('mongoose');
var _ = require('lodash');
var Schema = mongoose.Schema;
var User = require('./user.js')
var push = require('../utils/push.js')
var mail = require('../utils/mailgun.js')

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

bookingSchema.pre('save', function (next) {
	var booking = this
	//TODO mettere nel middleware precedente user....
	User.findById(this.user)
	.exec(function(err,user){
		
		Booking.find({date:booking.date, gameType:booking.gameType, circolo:user.circolo,court:booking.court})
		.exec(function(err,results){
				 //console.log(results)
				 var tmp = []
                  _.each(results, function (item){
                      tmp.push(item.ranges)
                  })
                  var otherGamesRanges = _.flatten(tmp)
				  
                  var intersection = _.intersection(booking.ranges,otherGamesRanges)
                  if (intersection.length > 0){
					  console.log('Prenotazione non disponibile!')
					  var err = new Error('Ooooops!!! Prenotazione non disponibile!!!');
  					  next(err);
				  }
                  else
                   next()																						 
			  })

		
	})
	
});


bookingSchema.post('save', function (doc) {
	
	
	
		if (this.isNew){
		   //TODO sendemail ad admin
		   User.findOne({role:'admin', circolo:this.circolo})
		   
		   .exec(function(err,userAdmin){
			   var email = userAdmin.email
			   var messagex = "Campo: " + this.court +  " - Data: " + date.format("DD/MM/YYYY") + " - Orario: " + this.startHour + " - Utente: " +  req.user.nome 
			   mail.sendMessage(email,messagex)
				
		   })
		   
	   }
	
	   if (this.isNew && this.callToAction){
		   //TODO SendPush a tutti i player con lo stesso livello e +1
		   User.find({circolo:this.user.circolo, $or: [ {'level':this.user.level}, {'level': this.user.level + 1} ]})
				.exec(function(error,results){
					_.each(results, function (item){
                      	push.pushMessage(item, "Ciao, il " + this.date.format("DD/MM/YYYY") + " giocherà una partita. Perchè non ti unisci?")
                  })
				
			})
	   }
	   

});

var Booking = mongoose.model('Booking', bookingSchema);



// make this available to our users in our Node applications
module.exports = Booking;
