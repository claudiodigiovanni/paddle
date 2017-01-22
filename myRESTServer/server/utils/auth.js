var jwt = require('jwt-simple');
var User = require('../model/user.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var utils = require('./utils.js');
var _ = require('lodash');
var Installation = require('../model/installation.js').Installation;

var pushMessage = require('../utils/push.js').pushMessage
var mail = require('../utils/mailgun.js')

var auth = {

  login: function(req, res,next) {

    
		var myemail = req.body.email || '';
    
		console.log(myemail);
		
		var password = req.body.password || '';

    if (myemail == '' || password == '') {
      //res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials..."
      });
      return;
    }
	  
	User.findOne({ $or: [{'email': myemail},{'nome': myemail}] }).populate('circolo').exec( function (err, user) {
		
  	if (err) {
			console.log(err);
			return next(err)	
		}
		if (user == null) {
			//res.status(401);
		    res.json({
			  "status": 401,
			  "message": "Invalid credentials..."
		  	});
		    return;	
		}
		if (!user.enabled) {
			//res.status(402);
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
	
		if (req.body.email == '' || req.body.password == '') {
		 
		  res.json({
			"status": 401,
			"message": "Invalid credentials"
		  });
		  return;
		}
		
		 User.findOne({$or: [{'email': req.body.email},{'nome': req.body.nome}]}).exec( function (err, user) {
			if (user != null) {
				console.log("signup: check duplicate email or nome...")
				res.json({
				"status": 401,
				"message": "Email o nome gia' esistente!"
				});
				return;
			}
			console.log("signup: check duplicate email/nome...continue!")
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
			})
		})	
	},
  validateUser: function(email) {
	 return User.findOne({ 'email': email , 'enabled': true}, function (err, user) {
  		if (err) throw err;
  		return user
	 })
  },
  resetPwd:function(req, res,next){
	    User.findOne({email : req.body.user}).exec(function (err, user) {
		if (err) {
			next(err)
			return
		};
		if (user == null || user.installations == null || user.installations.length == 0){
			res.json({status:400, message:'User not existent!!!!'})
			return
		}	
		var installations = user.installations
		var index = _.findIndex(installations,function(item){
			return item.jwtToken == req.body.token
		})
		if (index == -1){
			res.json({status:400, message:'Installation not existent!!!!'})
			return
		}
		user.password = req.body.newPassword
		user.save()
		res.json({succes: true});
	 })
  },
  registerToken: function(req,res,next){
	  console.log('********************registerToken**********************')
	  console.log(req.body)
	  User.findById(req.body.user).exec(function(err,user){
		  var installations = user.installations
		  var index = _.findIndex(installations,function(item){
			  return item.deviceToken == req.body.deviceToken
			  
		  })
		  if (index == -1){
			    var newInstallation = new Installation();
				newInstallation.deviceToken = req.body.deviceToken
				newInstallation.deviceType = req.body.deviceType
				newInstallation.user = req.body.user
				newInstallation.jwtToken = req.body.jwtToken
				user.installations.push(newInstallation)
				user.save()
		  }
		  res.json({succes: true});
	  })
	  
  },
  requestPasswordReset: function(req, res,next){
	  console.log('requestPasswordReset...')
	  var email = req.body.email
	  
	  User.findOne({email:email}).then(
	  function(user){
		  //**********************
		  if (user == null || user.installations && user.installations.length == 0){
			  res.status(500).send('Ops! Utente non esistente')
			  return
		  }
		  var installation = user.installations[0]
		  
		  mail.sendMessage(email,"Hai richiesto il reset della tua password. <a href='http://localhost:8080/#/resetPwd/"  + email + "/" + installation.jwtToken + "'>fai click qui per procedere!</a>")
		  res.json({
				  "status": 200,
				  "message": "Ok, mail sent!"
				});
		  }
		  //**********************
	  ,function (err){
		  res.status(500).send('Ops! Utente non esistente')
	  })
	  
	  
  }
	
}
	

// private method
function genToken(user) {
  /*var expires = expiresIn(1); // 1 days
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());*/
  var token = jwt.encode({
  }, require('../config/secret')())
  
  return {
    token: token,
    //expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
	
}

module.exports = auth;
