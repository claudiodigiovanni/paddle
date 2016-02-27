var express = require('express');
var router = express.Router();
var utils = require('./utils/utils.js')
var _ = require('lodash');

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
	Booking.find({ 'date': req.body.date, 'circolo':req.body.circolo, 'gameType':req.body.gameType, 'endHour': {$gte: req.body.endHour},'startHour': {$lte: req.body.startHour}  })
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

router.post('/api/v1/createBooking', function(req, res,next) {
	var booking = new Booking()
	utils.copyProperties(req.body.book,booking)
	  
	logger.debug(booking)
	booking.save(function(err) {

	  	if (err) return next(err);
	  	logger.debug('Booking saved successfully!');
	  	res.json({succes: true, data: booking});
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
	
	Booking.findByIdAndUpdate(req.body.id, {$push: { 'players': req.body.user }})
		.populate('players')
		.exec( function (err, booking) {
		
			 var numPlayers = b.playersNumber
			 if (booking.callToAction == true && booking.players.length == numPlayers ){
				 var players = booking.players
				_.each(players,function(item){
					
					push.pushMessage(item, "La Partita del "  + date.format("DD/MM/YYYY")  + " si farà!")
				})
			 }
		  	res.json({data: booking});
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
	
	Invitation.findByIdAndRemove(req.body.idInvitation)
		.exec( function (err, invitation) {
			  logger.debug('invitation removed....')
		})
	Booking.findByIdAndUpdate(req.body.idBooking, {$push: { 'players': req.body.user }})
		.exec( function (err, booking) {
		  res.json({data: booking});
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
					if (booking.callToAction == true && booking.players.length == numPlayers ){
						 var players = booking.players
						_.each(players,function(item){
							push.pushMessage(item, "La Partita del "  + date.format("DD/MM/YYYY")  + " si farà!")
						})
					 }
					
				})
            	res.json({'message':'ok'})
			  
			})

});


router.post('/api/v1/findPlayersWithName', function(req, res,next) {
	logger.debug(req.body.name)
	var name = req.body.name
	User.find({'nome': {$regex: '.*' + name + '.*'}, 'circolo': req.body.circolo})
			.populate('players')
			.exec( function (err, results) {  
				logger.debug(results)
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
	
	
	var imgBuf = new Buffer(req.body.image, 'base64');
	var user = req.body.user
	User.findById(user).exec(function(err,user){
		user.image = imgBuf
		user.save()
		res.json({'data': user});
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
