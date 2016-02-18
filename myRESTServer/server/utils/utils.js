var _ = require('lodash');

var utils = {
	
	copyProperties :  function (from, to) {
		console.log('from')
		console.log(from)
		console.log(to)
		var properties = _.keys(from)
		console.log(properties)
		_.each(properties,function(property){
			console.log(property)
			to[property] = from[property];	
		})
		
}
	
	
}

module.exports = utils