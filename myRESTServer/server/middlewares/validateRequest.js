var jwt = require('jwt-simple');
var validateUser = require('../utils/auth.js').validateUser;
var regenerateToken = require('../utils/auth.js').regenerateToken;

module.exports = function(req, res, next) {

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] ||  req.headers['X-Access-Token'];
  // The key would be the logged in user's username
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    try {
		
        if (token == null || key == null) {
			console.log('Invalid Token or Key')
            
            res.json({
                "status": 401,
                "message": "Invalid Token or Key...."
            });
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
