var jwt = require('jwt-simple');
var validateUser = require('../utils/auth.js').validateUser;
var logger = require('../utils/logger.js')

module.exports = function(req, res, next) {

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] ||  req.headers['X-Access-Token'];
  // The key would be the logged in user's email
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'] || req.headers['X-Key'];

    try {
		
					if (token == null || key == null) {
							logger.info('Invalid Token or Key....')
							res.status(400).send("Invalid Token or Key....")
							return;
					}
					
					var decoded = jwt.decode(token, require('../config/secret.js')());
			
					logger.info('***JWT DECODED*****')
					validateUser(key).then(function(user){
					
					//	var payload = { foo: 'bar1' };
					if (user && decoded && decoded.foo == 'bar1') {
							req.user = user
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
					},function(error){
						logger.info(err)
						next(err)
					})
				} catch (err) {
					logger.info('errore JWT')
					logger.info(err)
					next(err)
				}
   
};
