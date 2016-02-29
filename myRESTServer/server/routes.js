var fs = require('fs')
var express = require('express');
var router = express.Router();
var utils = require('./utils/utils.js')
var _ = require('lodash');
var moment = require('moment');

var auth = require('./utils/auth.js');
var Circolo = require('./model/circolo.js');
var User = require('./model/user.js');

var Booking = require('./model/booking.js')
var Dashboard = require('./model/dashboard.js');
var Invitation = require('./model/invitation.js');
var Recharge = require('./model/recharge.js');
var Payment = require('./model/payment.js');
var Q = require('q')
var logger = require('./utils/logger.js')

var pushMessage = require('./utils/push.js').pushMessage
var mail = require('./utils/mailgun.js')
/*
 * Routes that can be accessed by any one
 */ 

router.post('/login', auth.login);
router.post('/registerToken', auth.registerToken);
router.post('/signup', auth.signup);
router.post('/requestPasswordReset',auth.requestPasswordReset);
router.post('/resetPwd',auth.resetPwd);


/*
 * Routes that can be accessed only by autheticated users
 */
router.post('/api/v1/circolo/', function(req, res,next) {
	
	var c = req.body
	//TODO: copiare campi
	var cx = new Circolo({
	  nome: 'ASD Magic Padel',
	  logo: 'sevilayha'
	});

	cx.save(function(err) {

	  if (err) next(err);
	  	logger.debug('Circolo saved successfully!');
	  	res.json({succes: true, circolo: cx});
	});
	
	

});

router.get('/api/circolo/', function(req, res,next) {
	
	Circolo.find({}, function(err, circoli) {
	  if (err) return next(err);
	  res.json({succes: true, circoli: circoli});
	   
	});
	
	

});

router.post('/api/v1/dashboardText', function(req, res,next) {
	var c = req.body.circolo
	logger.debug('circolo')
	logger.debug(c)
	Dashboard.find({'circolo':c}, function(err, dashboard) {
	  if (err) return next(err);
	  	res.json({data: dashboard});
	   
	});
	
	

});

router.post('/api/v1/checkBeforeCreateBooking', function(req, res,next) {
	var date = new Date(req.body.date)
	var ranges = req.body.ranges
	var gameT = req.body.gameT
	var courtsNumber = req.body.courtsNumber
	var circolo = req.body.circolo
	//*****************************************************
	var defer = Q.defer()
	var courtsAvalaivable = []
	var courts = _.range(1,parseInt(courtsNumber) + 1)
	//findBookingsInDate(date,gameT)
	//findBookingsInDateAndRange(date,gameT,ranges)
	Booking.find({ 'date': date, 'circolo':circolo, 'gameType':gameT })
		.populate('players user')
		.exec( function (err, bookings) {
			if (err){
				next(err)
				return
			}
			console.log(bookings)
			courts.forEach(function(court){
			  //console.log("court:" + court);
			  var avalaible = true
			  ranges.forEach(function(r){
				var p = _.filter(bookings, function(item){
				  if (item.ranges != null &&
					  item.ranges.indexOf(r) != -1 &&
					  item.court != null &&
					  item.court == court){
					return item
				  }
				})

			  if ( p != null && p.length > 0){
				  avalaible = false
				}
			  })
			  if (avalaible == true){
				courtsAvalaivable.push(court)
			  }

			})

			 //****OPTIMISE: elimino i campi che hanno prenotazioni che creerebbero un buco di mezz'ora****
			var optimezedCourts = courtsAvalaivable.slice(0)
			var startRange = parseInt(_.head(ranges))
			//console.log(startRange)
			var endRange   = parseInt(_.last(ranges))
			//console.log(endRange)
			courtsAvalaivable.forEach(function(court){
				  //console.log("COURT****************************:" + court)
				  var p = _.filter(bookings, function(item){
				  //console.log(item)
				  var ranges = item.ranges
				  if ( item.court == court && ((ranges.indexOf(startRange-1) == -1 &&  
												ranges.indexOf(startRange-2) != -1) ||
												(ranges.indexOf(endRange + 1) == -1 &&  
												ranges.indexOf(endRange + 2) != -1) ))
					  {
						return item
					  }
				  })
				  if (p.length != 0)
					 _.pull(optimezedCourts,court)
			})

			console.log('******COURTS FASE 1*****')
			console.log(courtsAvalaivable)
			console.log('******COURTS FASE 2*****')
			console.log(optimezedCourts)

			if (optimezedCourts.length > 0){
			  defer.resolve(optimezedCourts)
			}
			//**********FINE OPTIMISE*********************************************************************

			else if (courtsAvalaivable.length > 0){
			  defer.resolve(courtsAvalaivable)
			}
			else {
			  defer.reject("Campo non disponibile nella fascia oraria selezionata!")
			}
			
			defer.promise.then(function(results){
				
				res.json({status:200,data:results})
				return
			},function(error){
				
				res.json({status:400})
				return
			})
		
		})
	//*****************************************************
	
});



router.post('/api/v1/findBookingsInDate', function(req, res,next) {
	logger.debug(req.body)
	Booking.find({ 'date': req.body.date, 'circolo':req.body.circolo, 'gameType':req.body.gameType })
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
});

router.post('/api/v1/findBookingsInDateAndRange', function(req, res,next) {
	logger.debug(req.body)
	
	var ranges = req.body.ranges
	var gameT = req.body.gameType
	var date = new Date(req.body.date)
	
	 //2 ore
	var time = (2 * 3600 * 1000);
	var startRange = parseInt(_.head(_.sortBy(ranges)))
	var endRange   = parseInt(_.last(_.sortBy(ranges)))

	//[hh,mm]
	var hmStart = utils.getHourMinuteFromSlot(startRange)
	var startHour = new Date(date.getTime())
	startHour.setHours(hmStart[0])
	startHour.setMinutes(hmStart[1])

	var hmEnd = utils.getHourMinuteFromSlot(endRange)
	var endHour =new Date(date.getTime())
	endHour.setHours(hmEnd[0])
	endHour.setMinutes(hmEnd[1] + 30)

	var xx = new Date(startHour.getTime() - time);
	var yy = new Date(endHour.getTime() + time);
	
		
	Booking.find({ 'date': date, 'circolo':req.body.circolo, 'gameType':gameT, 'endHour': {$gte: endHour},'startHour': {$lte:startHour}  })
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/findBookingsToPayBeforeDate', function(req, res,next) {
	logger.debug(req.body)
	Booking.find({ 'circolo':req.body.circolo, 'date': {$lte: req.body.startHour}, 'payed':false  })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});


router.post('/api/v1/findaAvalaibleRangesInDate', function(req, res,next) {
	logger.debug(req.body)
	var avalaibleRanges = [];
	var date = req.body.date
	var gameT = req.body.gameT
	var circolo = req.body.circolo
	var courtsNumber = req.body.courtsNumber
	
	Booking.find({ 'date': date, 'circolo':circolo, 'gameType':gameT })
		.populate('players user')
		.exec( function (err, bookings) {
			//config.slotsNumber = 48
		  	var myranges = _.range(1, parseInt(48) + 1);
			_.each(myranges, function(r){
			  var px =  _.filter(bookings,function(item){

				  if (item.ranges.indexOf(r) != -1 )
					  return item;
			  });

			  if (px.length < courtsNumber){
				  avalaibleRanges.push(r);
			  }
			})
			res.json({succes: true, data: avalaibleRanges});
		
		})            
});


router.post('/api/v1/createBooking', function(req, res,next) {
	var obj = new Booking()
	utils.copyProperties(req.body.book,obj)
	
	if (obj.callToAction == true){
		obj.players = []
		obj.players.push(obj.user)
		obj.playersNumber = parseInt(obj.playersNumber) + 1
	}
	var maestroId = obj.maestro != null ? obj.maestro._id : -1
	//console.log(maestroId);
	if (maestroId != -1){
	  //var Maestro = Parse.Object.extend("Maestro");
	  var maestro = {}
	  maestro._id = maestroId
	  obj.maestro = maestro
	}

	var startRange = parseInt(_.head(_.sortBy(obj.ranges)))
	var endRange   = parseInt(_.last(_.sortBy(obj.ranges)))

	console.log(startRange)
	console.log(endRange)
	console.log(obj.ranges)
	console.log(obj.date)

	//[hh,mm]
	var hmStart = utils.getHourMinuteFromSlot(startRange)
	var startHour = new Date(obj.date.getTime())
	startHour.setHours(hmStart[0])
	startHour.setMinutes(hmStart[1])
	console.log(startHour)

	var hmEnd = utils.getHourMinuteFromSlot(endRange)
	var endHour =new Date(obj.date.getTime())
	endHour.setHours(hmEnd[0])
	endHour.setMinutes(hmEnd[1] + 30)
	console.log(hmEnd)
	console.log(endHour)

	obj.startHour = startHour
	obj.endHour = endHour

	obj.save(function(err) {

		if (err) return next(err);
		logger.debug('Booking saved successfully!');
		res.json({succes: true, data: obj});
	});
	
});

router.post('/api/v1/findMyBookings-part1', function(req, res,next) {
	
	
	Booking.find({ 'user':req.body.user, 'date': {$gte: req.body.date} })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/findMyBookings-part2', function(req, res,next) {
	
	
	Booking.find({ 'user':{ $ne: req.body.user }, 'players': req.body.user, 'date': {$gte: req.body.date} })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/findCallToAction', function(req, res,next) {
	
	
	Booking.find({ 'circolo':req.body.circolo, 'callToAction': true, 'date': {$gte: req.body.date} })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/addCallToActionPlayer', function(req, res,next) {
  var cta = req.body.cta
  var userId = req.body.user
  
  var defer = Q.defer()
  var numPlayers = cta.playersNumber
  if (cta.players.length >= numPlayers ){
	defer.reject('Partita già al completo!')
  }
  else{
	var players = cta.players
	if (! _.find(players,{_id:userId})){

	  Booking.findByIdAndUpdate(cta._id, {$push: { 'players': userId }})
		.populate('players')
		.exec( function (err, booking) {
		
			 var numPlayers = booking.playersNumber
			 if (booking.callToAction == true && booking.players.length == numPlayers ){
				 var players = booking.players
				_.each(players,function(item){
					
					pushMessage(item, "La Partita del "  + date.format("DD/MM/YYYY")  + " si farà!")
				})
			 }
		  	defer.resolve(booking)
		  	
		}) 
	}else
	  defer.reject('Utente già inserito') 
  }   
    defer.promise .then(
	function(obj){
		res.json({status: 200, data: booking});
	},
	function(error){
		res.json({status: 400});
	})
	
	        
});

router.post('/api/v1/findMyInvitations', function(req, res,next) {
	
	Invitation.find({ 'user':req.body.user })
		.populate('booking booking.players booking.user')
		.exec( function (err, invitations) {
		  res.json({data: invitations});
		})
	
            
});

router.post('/api/v1/countMyInvitations', function(req, res,next) {
	
	Invitation.count({ 'user':req.body.user })
		.exec( function (err, invitations) {
		  res.json({data: invitations});
		})
	
            
});

router.post('/api/v1/findMyGameNotPayed-part1', function(req, res,next) {
	
	
	Booking.find({ 'user':req.body.user, 'date': {$lte: req.body.date}, payed:false })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/findMyGameNotPayed-part2', function(req, res,next) {
	
	
	Booking.find({ 'user':{ $ne: req.body.user }, 'players': req.body.user, 'date': {$lte: req.body.date},  payed:false })
		.sort('-date')
		.populate('players user')
		.exec( function (err, bookings) {
		  res.json({data: bookings});
		})
	
            
});

router.post('/api/v1/acceptInvitation', function(req, res,next) {
	
	var defer = Q.defer()
	Invitation.findById(req.body.idInvitation)
		.populate('booking booking.players')
		.exec( function (err, invitation) {
		  	var booking = invitation.booking
			var players = booking.players
			var index = _.findIndex(players,function(p){
			  return p.id == $rootScope.currentUser._id
			})
			console.log(index)
			//*****************
			 var numPlayersCurrent = booking.players != null ? booking.players.length : 0
			 var numPlayers = booking.playersNumber
			 if (numPlayers == numPlayersCurrent){
			  defer.reject("Ooopssss! La Call è già completa! Puoi solo declinare l'invito....") 
			 }
			//*****************
			 else if (index != -1){
			  defer.reject("Utente già iscritto alla partita...")
			 }
			 else {
				Invitation.findByIdAndRemove(req.body.idInvitation)
					.exec( function (err, invitation) {
						 logger.debug('invitation removed....')
					})
				Booking.findByIdAndUpdate(req.body.idBooking, {$push: { 'players': req.body.user }})
					.exec( function (err, booking) {
					  	 logger.debug('booking update....')
					})
				defer.resolve("ok acceptInvitation");
			 }
			 defer.promise.then(function(response){
				 res.json({status:200})
			 },function(error){
				 res.json({status:400})
			 })	
		})          
});

router.post('/api/v1/declineInvitation', function(req, res,next) {
	
	Invitation.findByIdAndRemove(req.body.idInvitation)
		.exec( function (err, invitation) {
			  logger.debug('invitation removed....')
			  res.json({message: 'invitation removed'});
		})
	
	
            
});

router.post('/api/v1/saveNote', function(req, res,next) {
	
	
	Booking.findByIdAndUpdate(req.body.id, {note:req.body.note})
		.exec( function (err, booking) {
		  res.json({data: booking});
		})
	
            
});

router.get('/api/v1/getRecharges', function(req, res,next) {
	
	Recharge.find({user:req.body.user})
		.sort('-date')
		.exec( function (err, recharges) {
		  res.json({data: recharges});
		}) 
});

router.post('/api/v1/addCharge', function(req, res,next) {
	//TODO....Rsipostsa solo dopo che ho completato le due operazioni...
	var recharge = new Recharge()
	recharge.user = req.body.user
	recharge.qty = req.body.qty
	
	recharge.save(function(err) {

	  if (err) next(err);
	  	logger.debug('recharge saved successfully!');
	});
	
	User.findByIdAndUpdate(req.body.user, { $inc: { residualCredit: qty }})
		.exec( function (err, user) {
		  logger.debug('User residualCredit saved successfully!');
		})
	
	res.json({message: 'ok'});
	            
});

router.get('/api/v1/getPayments', function(req, res,next) {
	
	Payment.find({user:req.body.user})
		.populate('booking')
		.sort('-createdAt')
		.exec( function (err, payments) {
		  res.json({data: payments});
		}) 
});

router.get('/api/v1/getPaymentsByBooking', function(req, res,next) {
	
	Payment.find({booking:req.body.booking})
		.populate('user booking')
		.sort('-createdAt')
		.exec( function (err, payments) {
		  res.json({data: payments});
		}) 
});

router.post('/api/v1/payQuota', function(req, res,next) {
	
	var payment = new Payment()
	payment.circolo = req.body.circolo
	payment.booking = req.body.booking
	payment.type="quota"
	payment.qty = 1 
	payment.save(function(err) {

	  if (err) next(err);
		
	  	logger.debug('payment saved successfully!');
		res.json({message: 'ok', data:payment});
	});
	          
});

router.post('/api/v1/payTessera', function(req, res,next) {
	
	var payment = new Payment()
	payment.circolo = req.body.circolo
	payment.booking = req.body.booking
	payment.type="tessera"
	payment.qty = 1 
	payment.save(function(err) {

	  if (err) next(err);
		
	  	logger.debug('payment saved successfully!');
		res.json({message: 'ok'});
	});
	          
});


router.post('/api/v1/deletePayment', function(req, res,next) {
	
	Payment.findById(req.body.payment)
		.populate('booking')
		.exec(function(error,payment){
		var user = payment.user
		if (user != null){
			User.findByIdAndUpdate(user, { $inc: { residualCredit: -1 }})
			.exec( function (err, user) {
			  logger.debug('User residualCredit saved successfully!');
			})
		}
		
		res.json({message: 'ok'});
	})
	
	          
});

router.post('/api/v1/enabling', function(req, res,next) {
	
	User.findByIdAndUpdate(req.body.user, { enabled: !enabled})
			.exec( function (err, user) {
			  logger.debug('User residualCredit saved successfully!');
			})
	          
});

router.post('/api/v1/changeUserLevel', function(req, res,next) {
	
	User.findByIdAndUpdate(req.body.user, { level: req.body.level})
			.exec( function (err, user) {
			  logger.debug('User changeUserLevel saved successfully!');
			})
	          
});

//Se l'utente in sessione ha ruolo admin o segreteria elimino e basta
//KKK eliminare le invitations
//Se l'utente in sessione è l'organizzatore la partita viene cancellata
// Se l'utente in sessione è stato invitato viene tolto dai players
router.post('/api/v1/deleteBooking', function(req, res,next) {
	
	Booking.findById(req.body.booking)
			.populate('players')
			.exec( function (err, booking) {
			  logger.debug('User changeUserLevel saved successfully!');
			  var user = req.body.user
			  if (req.body.role == 'admin' || req.body.role == 'segreteria' || user == booking.user){
				  booking.remove();  
				  res.json({message:'ok'})
				  return
			  }
			  booking.update({$pull: {players:{_id: user}}})
			  .exec(function(error,booking){
				  res.json({message:'ok'})	  
			  })
			  
			})
	          
});

router.post('/api/v1/setCallToAction', function(req, res,next) {
	var defer = Q.defer()
	Booking.findById(req.body.booking)
			.populate('players')
			.exec( function (err, booking) {  
				var numPlayersCurrent = booking.players != null ? booking.players.length : 0
				var numPlayers = numPlayersCurrent + req.body.playersNumberMissing
				if (booking.callToAction){
					var promise1 = booking.update({'playersNumber':numPlayers})
					defer.resolve(promise1);
				}
				else{
					var u = req.body.user
					var promise2 = booking.update({playersNumber:numPlayers+1, "callToAction": true,  $push: {'players':u} })
					defer.resolve(promise2);
				}
				defer.promise.then(function(result){
					console.log('***********setCallToAction*********')
					var date = moment(new Date(booking.date))
					if (booking.callToAction == true && booking.players.length == numPlayers ){
						 var players = booking.players
						_.each(players,function(item){
							console.log('players')
							pushMessage(item._id, "La Partita del "  + date.format("DD/MM/YYYY")  + " si farà!")
						})
					 }
					
				})
            	res.json({'message':'ok'})
			  
			})

});

router.post('/api/v1/findPlayersWithName', function(req, res,next) {
	logger.debug(req.body.name)
	var name = req.body.name
	User.find({'nome': {$regex: '.*' + name.toLowerCase() + '.*'}, 'circolo': req.body.circolo})
			.populate('players')
			.exec( function (err, results) {  
            	res.json({'data':results})
			})
	          
});

router.post('/api/v1/invite', function(req, res,next) {
	
	var promises = []
	var promise1 = Booking.find({_id: req.body.bookingIdCalled, players: req.body.userIdToInvite })
			.populate('players')
	
	var promise2 = Invitation.find({ 'user':req.body.userIdToInvite, 'booking':req.body.bookingIdCalled })
	promises.push(promise1)
	promises.push(promise2)
	Q.all(promises).then(function(results){
				console.log(results)
				if (results[0].length == 0 && results[1].length == 0){
                      var invitation = new Invitation()
                      invitation.user = req.body.userIdToInvite
                      invitation.booking = req.body.bookingIdCalled
                      invitation.save()
                      
					  pushMessage(req.body.userIdToInvite,"Sei stato invitato ad una partita! Vai nella pagina account, sezione inviti, per i dettagli.")
					  console.log('after push...')
					  res.json({message:'ok'})
                }
                else{
                    logger.debug("L'utente è gia della partita! Oppure è già stato invitato....")
					res.json({message:'not ok'}) 
					 
				}  
		
	})
	          
});

router.post('/api/v1/findInvitationAlredySentForBooking', function(req, res,next) {
	logger.debug(req.body)
	Invitation.find({ 'booking':req.body.bookingId})
		.populate('user')
		.exec( function (err, invitations) {
		  res.json({data: invitations});
		}) 
		          
});

router.post('/api/v1/sendMessageBookingUsers', function(req, res,next) {
	Booking.findById(req.body.booking).exec(function(err,booking){
		 var players = booking.players
		_.each(players,function(p){
			console.log("sending Message....")
			pushMessage(p, req.body.message)
		  })

		if (! booking.callToAction){
			pushMessage(booking.user, req.body.message)
		 }
		res.json({success:true})
	})
	
		          
});

router.post('/api/v1/setPreferred', function(req, res,next) {
	logger.debug('setPreferred')
	logger.debug(req.body.userToAdd)
	User.findById(req.body.user)
		.populate('circolo')
		.exec( function (err, u) {
			  console.log(u)
			  var preferences = u.preferences
			  logger.debug(preferences)
			  if (preferences.indexOf(req.body.userToAdd) == -1){
				  console.log('11111')
					  u.preferences.push(req.body.userToAdd)
					  u.save().then(function(ux){
						  res.json({data: ux});
					  })
			  }
			  else{ 
					u.preferences.splice(preferences.indexOf(req.body.userToAdd), 1);
					u.save().then(function(ux){
						  res.json({data: ux});
					  })
			  }	 
			}) 
	       
});

router.post('/api/v1/getPreferred', function(req, res,next) {
	
	User.findById(req.body.user)
		.populate('preferences')
		.exec( function (err, user) {
		  	  logger.debug (user)
			  res.json({data: user});
		}) 
		
	
		          
});

router.post('/api/v1/setStatus', function(req, res,next) {
	
	//logger.debug('setStatus...' + req.body.user + ":" + req.body.status)
	try{
		User.findByIdAndUpdate(req.body.user, {'status':req.body.status}, function (err, user) {
			//logger.debug('setStatus222...')
		  	  if (err){
				 logger.debug(err)
				 next(err)  
			  } 
			logger.debug(user)
			res.json({data: user});
		}) 
	}
	catch(error){
		logger.debug(error)
	}
	
		
	
		          
});

router.post('/api/v1/getPlayersByLevel', function(req, res,next) {
	
	User.find({'level':req.body.level, 'circolo': req.body.circolo })
		
		.exec( function (err, results) {
		  
			  res.json({'data': results});
		}) 
		
	
		          
});

router.post('/api/v1/saveImage/', function(req, res,next) {
	
	
	/*var imgBuf = new Buffer(req.body.image, 'base64');
	var user = req.body.user
	User.findById(user).exec(function(err,user){
		user.image = imgBuf
		user.save().then(function(success){
			//console.log(user)
			var image = new Buffer(user.image).toString('base64');
			//console.log(image)
			res.json({'data': image});
		})
		
	})*/
	var ux = req.body.user
	User.findById(ux).exec(
	function(err,user){
		var imageToDelete = user.image
		var newImage = ux + "-" + (new Date()).getTime() + ".png"
		fs.unlink("../../www/img/users/" + imageToDelete, function(err) {
			  console.log("Old Image File deleted successfully!");
		 });
	   	fs.writeFile( "../../www/img/users/" + newImage, req.body.image, 'base64', function(err) {
		  if (err){
			  console.log(err)
			  next(err)
			  return
		  }
		  user.image = newImage
		  user.save()
		  res.json({'data': user});
		  
	  });
		
	})
	
	
	

});
             		
/*
 * Routes that can be accessed only by authenticated & authorized users
 */
/*router.get('/api/v1/admin/users', user.getAll);
router.get('/api/v1/admin/user/:id', user.getOne);
router.post('/api/v1/admin/user/', user.create);
router.put('/api/v1/admin/user/:id', user.update);
router.delete('/api/v1/admin/user/:id', user.delete);*/

module.exports = router;
