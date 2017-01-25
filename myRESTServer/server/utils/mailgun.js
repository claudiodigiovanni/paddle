var Installation = require('../model/installation.js');
var apiKey = 'key-c88b7957c124942a3a24311f0970f929';
var Mailgun = require('mailgun-js');
var mailgun = new Mailgun({apiKey: apiKey, domain:'sandboxb318624be69540219e6c0e4769735e6b.mailgun.org'});

var myfunction = {

	sendMessage : function(email,message){
	
    console.log("sendMessage");
	var data = {
    //Specify email data
      from: 'magicpadel@magicpadel.it',
    //The email to contact
      to: email,
    	//Subject and text data  
      subject: 'Magic Booking',
      html: message
    }
    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            console.log("got an error: ", err);
        }
        //Else we can greet    and leave
        else {
            console.log(body);
        }
    });
		
	}
}


module.exports = myfunction

