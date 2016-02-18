var User = require('./model/user.js');
var Circolo = require('./model/circolo.js');
var Dashboard = require('./model/dashboard.js');

var init = {
	
	initDB : function(){
		
	/*User.remove({}, function (err) {
	  if (err) return next(err);
	  // removed!
	});
	
	Circolo.remove({}, function (err) {
	  if (err) return next(err);
	  // removed!
	});
	Dashboard.remove({}, function (err) {
	  if (err) return next(err);
	  // removed!
	});*/
	var cx = new Circolo({
	  nome: 'ASD Magic Padel',
	  logo: 'mylogo.png',
	  "gameType1": {
            "courtsNames": [
                "verde",
                "rosso",
                "blu"
            ],
            "courtsNumber": 3,
            "name": "Paddle",
            "numberPlayers": [
                4
            ]
        },
        "gameType2": {
            "courtsNames": [
                "1",
                "2"
            ],
            "courtsNumber": 2,
            "name": "Tennis - Rosso",
            "numberPlayers": [
                2,
                4
            ]
        },
        "gameType3": {
            "courtsNames": [
                "1", 
                "2"
            ],
            "courtsNumber": 2,
            "name": "Tennis - Sintetico",
            "numberPlayers": [
                2,
                4
            ]
        },
	});

	cx.save(function(err) {

	  if (err) console.log(err);
	  	console.log('Circolo saved successfully!');
	});
		
	var dsh = new Dashboard({area0:'aaa',area1:'aaa',area2:'aaa',area3:'aaa',circolo:cx})
	
	dsh.save(function(err) {

	  if (err) console.log(err);
	  	console.log('Dashboard saved successfully!');
	});
		
	var user = new User({nome:'yyy',username:'yyy', password:'yyy',circolo:cx})
	user.save(function(err) {

	  if (err) console.log(err);
	  	console.log('user saved successfully!');
	});
	

		
	
}
}
module.exports = init
