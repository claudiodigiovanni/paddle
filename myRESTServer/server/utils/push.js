var _ = require('lodash');
var Installation = require('../model/installation.js').Installation;
var apn = require('apn');
var GCM = require('gcm').GCM;
var apiKey = 'AIzaSyC8yrIrtBJykLJKBoRvMwVP2-s2Yab1Qr8';
var gcm = new GCM(apiKey);



var myfunctions = {
		pushMessage: function(user,message){
			console.log('pushMessage') 
			User.findById(user).exec(function(err,user){
				 var results = user.installations
				 if (results == null || results.length == 0){
					 console.log('no installations.....')
					 return
				 }
					 
				_.each(results,function(installation){

					var deviceType = installation.deviceType
					var deviceToken = installation.deviceToken

					if (deviceType == 'ios'){
						var myDevice = new apn.Device(deviceToken);
						var note = new apn.Notification();
						note.badge = 0;
						note.alert = { "body" : message};
						note.payload = {'messageFrom': 'ASD Magic Padel'};
						note.device = myDevice;

						var callback = function(errorNum, notification){
							console.log('Error is: %s', errorNum);
							console.log("Note " + notification);
						}
						var options = {

							errorCallback: callback,
							cert: '../cert/cert.pem',                 
							key:  '../cert/key.pem',                 
							passphrase: 'aleaiactaest',  
							production:true

						}
						var apnsConnection = new apn.Connection(options);
						apnsConnection.sendNotification(note);
					}
					else if (deviceType == 'android') {
						var message = {
							registration_id: deviceToken, // required
							collapse_key: 'Collapse key', 
							'data.message': message
						};

						gcm.send(message, function(err, messageId){
							if (err) {
								console.log("Something has gone wrong!");
								console.log(err)
							} else {
								console.log("Sent with message ID: ", messageId);
							}
						});

					}
					else{
						console.log('device platform not ebabled for pushing message')
					}

				})	
			})
	
		}
		
}
	

module.exports = myfunctions 


/*
var t1 = 'clOHF_kYfg8:APA91bGrNlvSKYfgTGNhs3wRAIZrmmI1AsgmvuuEkKRAutVC_Oynr6xzpeAPBp9_8TZ0YATSwp9WLSj97MU8eWHwT0Gkz05ERCMYlKdLonSHZRR8lSHM0PISW1pDMZihND-A-u6DnwfT'

var t2 = 'cI-XYQ7di88:APA91bFsoYd2Y1zsHhj0yqPqSfHvCAsbpFp72H1vVK8d6E8KPHkKJeApcPDqv9hVgd3b2ofeZOnU6CXxBdcYeWdS5aSjJlcwmhwAvm2Ye5vlPnX61LUYlwGtLH8PFvVlifjhlDWJfh4b'

var GCM = require('gcm').GCM;
var apiKey = 'AIzaSyC8yrIrtBJykLJKBoRvMwVP2-s2Yab1Qr8';
var gcm = new GCM(apiKey);

var message = {
				registration_id: t2, // required
				collapse_key: 'Collapse key', 
				'data.message': 'value2'
			};

gcm.send(message, function(err, messageId){
	if (err) {
		console.log("Something has gone wrong!");
		console.log(err)
	} else {
		console.log("Sent with message ID: ", messageId);
	}
});
*/

/*var gcm = require('android-gcm');
var apiKey = 'AIzaSyC8yrIrtBJykLJKBoRvMwVP2-s2Yab1Qr8';
// initialize new androidGcm object 
var gcmObject = new gcm.AndroidGcm(apiKey);
 
// create new message 
var message = new gcm.Message({
    registration_ids: [t2],
    data: { 
        message: 'testxxx'    
    }
});
 
// send the message 
gcmObject.send(message, function(err, response) {
	console.log(response)
});
*/