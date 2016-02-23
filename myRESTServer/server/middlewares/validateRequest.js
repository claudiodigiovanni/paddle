var jwt = require('jwt-simple');
var validateUser = require('../utils/auth.js').validateUser;
var regenerateToken = require('../utils/auth.js').regenerateToken;

module.exports = function(req, res, next) {

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] ||  req.headers['X-Access-Token'];
  // The key would be the logged in user's username
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    try {
		console.log(req.headers)
		console.log(key)
		console.log(token)
        if (token == null || key == null) {
			console.log('Invalid Token or Key....')
            
            res.status(402).send("Invalid Token or Key....")
		
			return;
        }
        
      var decoded = jwt.decode(token, require('../config/secret.js')());
	  console.log(decoded)
	  console.log('********')
		
      validateUser(key).then(function(user){
		  
		  if (user && decoded.exp > Date.now()) {
		  req.user = user
          next()
		  } 
		  else if (user && decoded.exp <= Date.now()){
			console.log('********regenerating Token***********')
			regenerateToken()
			next()
		  }
		  else {
			// No user with this name exists, respond back with a 401
			res.status(401);
			res.json({
			  "status": 401,
			  "message": "Invalid User"
			});
			return;
		  }
	  })
    } catch (err) {
	 	next(err)
    }
   
};
