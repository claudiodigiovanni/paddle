var User = require('../model/user.js');


module.exports = function(req, res, next) {


  // The key would be the logged in user's username
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
  var user = User.find({'username':key}).exec(function(err,user){
	  if (user.role == 'admin')
		  next()
	  else{
		   console.log('Invalid Role')
            
            res.json({
                "status": 401,
                "message": "Invalid Role...."
            });
            return;
	  }
	  
  })

   
   
};
