var Installation = require('../model/installation.js');
var apiKey = 'key-c88b7957c124942a3a24311f0970f929';
var Mailgun = require('mailgun').Mailgun
var mg = new Mailgun(apiKey);

var myfunction = {

	sendMessage : function(user,message){
		mg.sendText('xxxx@xxx.it',
			 [user.email],
			 'Magic Booking!',
			 message,
			 function(err) { 
				if (err) console.log('Oh noes: ' + err);
				else     console.log('Mail Success');	
			 });
	}
}


module.exports = myfunction

