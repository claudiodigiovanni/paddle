var jwt = require('jwt-simple');
var User = require('../model/user.js');
var Installation = require('../model/installation.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var utils = require('./utils.js');

var auth = {

  login: function(req, res,next) {

    var username = req.body.username || '';
    var password = req.body.password || '';

    if (username == '' || password == '') {
      //res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials..."
      });
      return;
    }
	  
	User.findOne({ 'username': username }).populate('circolo').exec( function (err, user) {
		
  		if (err) {
			console.log(err);
			next(err)
			return
		}
		console.log(user) 
		user.comparePassword(password, function(err, isMatch) {
            if (err) throw err;
            if( isMatch){
				
				res.json(genToken(user));
			}
			else{
				  //res.status(401);
				  res.json({
					"status": 401,
					"message": "Invalid credentials..."
				  });
				  return;
			}
		})
	 })
  },
	
  signup: function(req,res,next){
	    console.log("signup")
		

		if (req.body.username == '' || req.body.password == '') {
		 
		  res.json({
			"status": 401,
			"message": "Invalid credentials"
		  });
		  return;
		}
		var u = new User()
		
		//TODO: copiare campi
	  	utils.copyProperties(req.body,u)
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

  validateUser: function(username) {
    
	  
	 return User.findOne({ 'username': username }, function (err, user) {
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
