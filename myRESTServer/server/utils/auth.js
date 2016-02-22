var jwt = require('jwt-simple');
var User = require('../model/user.js');
var Installation = require('../model/installation.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var utils = require('./utils.js');

var push = require('../utils/push.js')
var mail = require('../utils/mailgun.js')

var auth = {

  login: function(req, res,next) {

    var email = req.body.email || '';
    var password = req.body.password || '';

    if (email == '' || password == '') {
      //res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials..."
      });
      return;
    }
	  
	User.findOne({ 'email': email }).populate('circolo').exec( function (err, user) {
		
  		if (err) {
			console.log(err);
			return next(err)	
		}
		if (user == null) {
			res.status(401);
		    res.json({
			  "status": 401,
			  "message": "Invalid credentials..."
		  	});
		    return;	
		}
		if (!user.enabled) {
			res.status(402);
		    res.json({
			  "status": 402,
			  "message": "User still not enabled..."
		  	});
		    return;	
		}
		console.log(user) 
		user.comparePassword(password, function(err, isMatch) {
            if (err) throw err;
            if( isMatch){
				
				res.json(genToken(user));
			}
			else{
				  res.status(401).send("Invalid credentials...")
				  return;
			}
		})
	 })
  },
	
  signup: function(req,res,next){
	    console.log("signup")
		

		if (req.body.email == '' || req.body.password == '') {
		 
		  res.json({
			"status": 401,
			"message": "Invalid credentials"
		  });
		  return;
		}
		var u = new User()
		
		//TODO: copiare campi
	  	utils.copyProperties(req.body,u)
		u.enabled = false
		console.log(u)
		u.save(function(err) {
			  console.log(err)
			  if (err){
				  next (err);
				  return
			  } 
			  console.log('user saved successfully!');
			
			  res.json({succes: true, user: u});
		});
			
	},

  validateUser: function(email) {
	 return User.findOne({ 'email': email }, function (err, user) {
  		if (err) throw err;
  		return user
	 })
	  
	  
	  
  },
	
  registerToken: function(req,res,next){
	  Installation.findOne({'deviceToken': req.body.deviceToken, 'user':req.body.user}).exec(
					function(err,installation){
						if (installation == null){
							var newInstallation = new Installation();
							newInstallation.deviceToken = req.body.deviceToken
							newInstallation.deviceType = req.body.deviceType
							newInstallation.user = req.body.user
							newInstallation.jwtToken = req.body.jwtToken
							newInstallation.save()
						}
						res.json({succes: true});
						
					})
  },
  
  regenerateToken: function(user){
	  Installation.findOne({'token': req.headers['X-Access-Token']}).exec(
					function(err,installation){
						if (installation){
							var token = genToken(req.user).token
							installation.token = token
							installation.save()
							return true
						}
						else
							return false
						
						
					})
  },
	
  requestPasswordReset: function(req, res,next){
	  console.log('requestPasswordReset...')
	  var email = req.body.email
	  mail.sendMessage(email,"Hai richiesto il reset della tua password. <a href='http://localhost:8080'>fai click qui per procedere!</a>")
  }
	
}

// private method
function genToken(user) {
  var expires = expiresIn(1); // 1 days
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());

  return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;
