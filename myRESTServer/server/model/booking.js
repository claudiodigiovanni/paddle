var mongoose = require('mongoose');
var _ = require('lodash');
var Schema = mongoose.Schema;
var User = require('./user.js')
var push = require('../utils/push.js')
var mail = require('../utils/mailgun.js')
var moment = require('moment');

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
	console.log("save0" + this)
	var booking = this
	this.wasNew = this.isNew;
	
	//TODO mettere nel middleware precedente user....
	User.findById(booking.user)
	.exec(function(err,user){
		console.log('...........pre.save:' + user)
		this.nome = user.nome
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
	
	
		console.log("bookingSchema.post save 0")
		if (this.wasNew){
		   //TODO sendemail ad admin
		   console.log("bookingSchema.post save 1")
		   User.findOne({role:'admin', circolo:this.circolo})
		   
		   .exec(function(err,userAdmin){
			   console.log("bookingSchema.post save 2")
			   var email = userAdmin.email
			   
			   var messagex = "Campo: " + doc.court +  " - Data: " + moment(doc.startHour).format("DD/MM/YYYY, h:mm:ss a") + " - Utente: " + this.nome 
			   console.log(messagex)
			   mail.sendMessage(email,messagex)
				
		   })
		   
	   }
	
	   if (this.wasNew && doc.callToAction){
		   //TODO SendPush a tutti i player con lo stesso livello e +1
		   User.find({circolo:doc.user.circolo, $or: [ {'level':doc.user.level}, {'level': doc.user.level + 1} ]})
				.exec(function(error,results){
					_.each(results, function (item){
                      	//push.pushMessage(item, "Ciao, il " + this.startHour.format("DD/MM/YYYY") + " giocherà una partita. Perchè non ti unisci?")
                  })
				
			})
	   }
	   

});

var Booking = mongoose.model('Booking', bookingSchema);



// make this available to our users in our Node applications
module.exports = Booking;
