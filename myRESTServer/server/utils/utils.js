var _ = require('lodash');

var utils = {


  /* Because day 0 equates to the last day of the previous month the number returned is effectively the number of days for the month we want.
    */
    getDaysInMonth: function(month,year) {
		
		var x = new Date(parseInt(year), parseInt(month) + 1, 0)
	  	x.setHours(0);
	  	x.setMinutes(0);
	  	x.setSeconds(0);
		  x.setMilliseconds(0)
      return x.getDate();
    },
	
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