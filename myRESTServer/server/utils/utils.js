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
		
	},
	getHourMinuteFromSlot : function(r){
      //[hh,mm]
      var ret = [];
      
        //console.log(r)
        r  = r - 0.5
        //console.log(r)
        if (parseInt(r) % 2 === 0 ){
          ret.push(parseInt(r) / 2)
          ret.push(0)
        }
        else{
            ret.push(parseInt(r / 2))
            ret.push(30)
        }
       
        
        
      return ret;
    }
	
	
}

module.exports = utils