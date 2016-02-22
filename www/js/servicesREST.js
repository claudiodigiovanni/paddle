angular.module('starter.servicesREST', [])

.factory('MyObjectsREST', function(Utility,$ionicLoading, $rootScope, config,$q,$http,$httpParamSerializer) {
	

    return {
		
	createBookingObject: function(){
		function Booking(){}
			
			Booking.prototype.set = function(property,value){
										this[property]=value		 
									}
			Booking.prototype.get = function(property){
										return this[property]		 
									}
			
			return new Booking()
	},  	
	login: function(email,pass){
		  
		  return $http({
		  	url: 'http://localhost:3000/login',
		  	method: 'POST',
		  	data: {'email':email, 'password':pass},
			headers: {
			   'Content-Type': 'application/json'
			 }
		  })  
	  },
	signup: function(user){
		  
		  return $http({
		  url: 'http://localhost:3000/signup',
		  method: 'POST',
		  data: user,
		  headers: {
			   'Content-Type': 'application/json'
			 }
		})
    },
	requestPasswordReset: function(email){
		return $http({
		  url: 'http://localhost:3000/requestPasswordReset',
		  method: 'POST',
		  data: email,
		  headers: {
			   'Content-Type': 'application/json'
			 }
		})
	},
	getCircoli: function(){
		return $http({
		  url: 'http://localhost:3000/api/circolo',
		  method: 'get'
		})
	},
	getDashboardText : function(){
        
        var text = []
        var c = $rootScope.currentUser.circolo
		return $http({
		  url: 'http://localhost:3000/api/v1/dashboardText',
		  method: 'POST',
		  data: {'circolo':c}
		})
      },
		
	//*********************BOOKCOURT2***********************
	checkBeforeCreateBooking: function(date,ranges,gameT){
        
        console.log(ranges)

        var defer = $q.defer()
        var courtsAvalaivable = []
        var courtsNumber = $rootScope.gameTypes[gameT].courtsNumber

        var courts = _.range(1,parseInt(courtsNumber) + 1)
        return this.findBookingsInDate(date,gameT)
        //return this.findBookingsInDateAndRange(date,gameT,ranges)
        .then(
          function(response){
			var bookings = response.results
            console.log(bookings)
            courts.forEach(function(court){
              //console.log("court:" + court);
              var avalaible = true
              ranges.forEach(function(r){
                var p = _.filter(bookings, function(item){
                  if (item.ranges != null &&
                      item.ranges.indexOf(r) != -1 &&
                      item.court != null &&
                      item.court == court){
                    return item
                  }
                })

                if ( p != null && p.length > 0){
                  avalaible = false
                }
              })
              if (avalaible == true){
                courtsAvalaivable.push(court)
              }

            })
            
             //****OPTIMISE: elimino i campi che hanno prenotazioni che creerebbero un buco di mezz'ora****
            var optimezedCourts = courtsAvalaivable.slice(0)
            var startRange = parseInt(_.head(ranges))
            //console.log(startRange)
            var endRange   = parseInt(_.last(ranges))
            //console.log(endRange)
            courtsAvalaivable.forEach(function(court){
                  //console.log("COURT****************************:" + court)
                  var p = _.filter(bookings, function(item){
                  //console.log(item)
                  var ranges = item.ranges
                  if ( item.court == court && ((ranges.indexOf(startRange-1) == -1 &&  ranges.indexOf(startRange-2) != -1) ||
                                                      (ranges.indexOf(endRange + 1) == -1 &&  ranges.indexOf(endRange + 2) != -1) ))
                      {
                        return item
                      }
                  })
                  if (p.length != 0)
                     _.pull(optimezedCourts,court)
            })
            
            console.log('******COURTS FASE 1*****')
            console.log(courtsAvalaivable)
            console.log('******COURTS FASE 2*****')
            console.log(optimezedCourts)
           
            if (optimezedCourts.length > 0){
              defer.resolve(optimezedCourts)
            }
			
            //**********FINE OPTIMISE*********************************************************************
            
            
            else if (courtsAvalaivable.length > 0){
              defer.resolve(courtsAvalaivable)
            }
            else {
              defer.reject("Campo non disponibile nella fascia oraria selezionata!")
            }
            return defer.promise;

        }, function(error){

          console.log(error);
          defer.reject(error)
          return defer.promise;
        })
      },	
    createBooking:function(obj){
		var context = this
        console.log(obj)
        return this.checkBeforeCreateBooking(obj.date,obj.ranges,obj.gameType)
        .then(
          function(courtsAvalaivable){
            
            var book = context.createBookingObject();
            book.set("user", $rootScope.currentUser._id);
            book.set("circolo", $rootScope.currentUser.circolo._id);
            book.set("date", obj.date);
            book.set("ranges", _.sortBy(obj.ranges));
			
            if (obj.court != null){
                book.set("court",obj.court.toString())
            }
            else {
              //Prende il primo campo disponibile
                book.set("court",courtsAvalaivable[0].toString());
            }

            book.set("callToAction",obj.callToAction);

            if (obj.callToAction == true){
				book.players = []
                book.players.push($rootScope.currentUser._id)
                book.set("playersNumber",parseInt(obj.playersNumber) + 1)

            }
            book.set("gameType",obj.gameType.toString());
            book.set("note",obj.note);
            book.set("payed",false);
            

         
            var maestroId = obj.maestro != null ? obj.maestro.id : -1


            //console.log(maestroId);
            if (maestroId != -1){
              //var Maestro = Parse.Object.extend("Maestro");
              var maestro = {}
              maestro._id = maestroId
              book.set('maestro',maestro)
            }
              
           
            
            var startRange = parseInt(_.head(_.sortBy(obj.ranges)))
            var endRange   = parseInt(_.last(_.sortBy(obj.ranges)))
            
            console.log(startRange)
            console.log(endRange)
            console.log(obj.ranges)
            
            console.log(obj.date)
            
            //[hh,mm]
            var hmStart = Utility.getHourMinuteFromSlot(startRange)
            var startHour = new Date(obj.date.getTime())
            startHour.setHours(hmStart[0])
            startHour.setMinutes(hmStart[1])
            console.log(startHour)
            
            var hmEnd = Utility.getHourMinuteFromSlot(endRange)
            var endHour =new Date(obj.date.getTime())
            endHour.setHours(hmEnd[0])
            endHour.setMinutes(hmEnd[1] + 30)
            console.log(hmEnd)
            console.log(endHour)
            
            book.set('startHour',startHour)
            book.set('endHour',endHour)
            
            console.log(book)
            
            return $http({
			  url: 'http://localhost:3000/api/v1/createBooking',
			  method: 'POST',
			  data: {'book':book}
			})

        }, function(error){

          console.log(error);
		  throw error
        })
      },
	findaAvalaibleRangesInDate: function(date,gameT){

        
        var avalaibleRanges = [];
        return this.findBookingsInDate (date,gameT)
        .then(
          function(response){
			var bookings = response.results
            var myranges = _.range(1, parseInt(config.slotsNumber) + 1);
            var num = $rootScope.gameTypes[gameT].courtsNumber

            _.each(myranges, function(r){
              var px =  _.filter(bookings,function(item){

                  if (item.ranges.indexOf(r) != -1 )
                      return item;
              });
              
              if (px.length < num){
                  avalaibleRanges.push(r);
              }
            })
            
            return avalaibleRanges;
        }, function(error){
            
            console.log(error);
            Utility.handleParseError(error);
        })
      },
	findBookingsInDate: function(date,gameT){
        var c = $rootScope.currentUser.circolo
		console.log(c)
		return $http({
		  url: 'http://localhost:3000/api/v1/findBookingsInDate',
		  method: 'POST',
		  data: {'circolo':c._id, 'date': date, 'gameType':gameT}
		})
	},
	findBookingsInDateAndRange: function(date,gameT,ranges){
            
            
        var startRange = parseInt(_.head(ranges))
        var endRange   = parseInt(_.last(ranges))
        
         //2 ore
        var time = (2 * 3600 * 1000);
        var startRange = parseInt(_.head(_.sortBy(ranges)))
        var endRange   = parseInt(_.last(_.sortBy(ranges)))

        //[hh,mm]
        var hmStart = Utility.getHourMinuteFromSlot(startRange)
        var startHour = new Date(date.getTime())
        startHour.setHours(hmStart[0])
        startHour.setMinutes(hmStart[1])
       
        var hmEnd = Utility.getHourMinuteFromSlot(endRange)
        var endHour =new Date(date.getTime())
        endHour.setHours(hmEnd[0])
        endHour.setMinutes(hmEnd[1] + 30)
        
        var xx = new Date(startHour.getTime() - time);
        var yy = new Date(endHour.getTime() + time);
			
		var c = $rootScope.currentUser.circolo
            
        return $http({
		  url: 'http://localhost:3000/api/v1/findBookingsInDateAndRange',
		  method: 'POST',
		  data: {'circolo':c._id, 'date': date, 'gameType':gameT, 'endHour':xx, 'startHour':yy}
		})
        
      },
	findBookingsToPayBeforeDate: function(date){
        console.log(date)
		var c = $rootScope.currentUser.circolo
        
		return $http({
		  url: 'http://localhost:3000/api/v1/findBookingsInDateAndRange',
		  method: 'POST',
		  data: {'circolo':c._id, 'date': date}
		})

        
      },
	
	getCoaches: function(){

        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        var c = Parse.User.current().get('circolo')
        query.equalTo('circolo',c)
        return query.find()
      },
	getCoachAvalabilitiesFilteredByBookings:function(month,year,maestroId, typeG){

            var courtsAvalabilities = []
            var avalabilities = []
            var myContext = this;
            $ionicLoading.show({
              template: 'Loading...'
            });


            console.log('maestroId:' + maestroId);
            return this.findAvalabilities(month,year,typeG)
            .then(
                function(results){

                  //formato: [{day:d, avalaibleRanges: []}]
                  courtsAvalabilities = results
                  //console.log(results);


                }, function(error){
                  console.log(error);
                  Utility.handleParseError(error);
                })
            .then(
              function(obj){
                return myContext.getDisponibilitaCoach(month,year,maestroId)
            }, function(error){
              console.log(error);
                Utility.handleParseError(error);
            })
            .then(
              function(disponibilitaCoach){

                console.log(disponibilitaCoach);
                console.log(courtsAvalabilities);

                _.each(disponibilitaCoach,function (d){
                  _.each(d.ranges),function(r){
                      var x = _.filter(courtsAvalabilities, function(item){

                      if (item.day == d.date.getDate() &&
                          item.avalaibleRanges.indexOf(r) != -1){
                        return item
                      }
                    })
                    if (x.length > 0)
                      avalabilities.push({day:d[date].getDate(),range:r});
                  }
                })
                //console.log(avalabilities);
                $ionicLoading.hide()
                return avalabilities;

            }, function(error){
                $ionicLoading.hide()
                console.log(error);
                Utility.handleParseError(error);
            })
                //************
      },
	
	//*********************CALL***********************
    addCallToActionPlayer: function(cta){


          var defer = $q.defer()
          var user = $rootScope.currentUser;
          var numPlayers = cta.playersNumber
          if (cta.players.length >= numPlayers ){
            defer.reject('Partita già al completo!')
          }
          else{
            var players = cta.players
            if (! _.find(players,{_id:user._id})){
				
			  $http({
				  url: 'http://localhost:3000/api/v1/addCallToActionPlayer',
				  method: 'POST',
				  data: {'id': cta._id, 'user':$rootScope.currentUser._id}
			  })
              .then(
                function(obj){
                  defer.resolve(obj)
              }, function(error){
                defer.reject(error)
                console.log(error);
              })
            }else
              defer.reject('Utente già inserito') 
          }   
           return defer.promise 
        },
     findCallToAction:function(){
		
		 
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
		  
		return $http({
		  url: 'http://localhost:3000/api/v1/findCallToAction',
		  method: 'POST',
		  data: {'circolo':$rootScope.currentUser.circolo._id, 'date': today}
		})
        },
    //**********************ACCOUNT*******************
	findMyBookings: function(){
        var promises = [];
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
		  
		var query1 = $http({
		  url: 'http://localhost:3000/api/v1/findMyBookings-part1',
		  method: 'POST',
		  data: {'user':$rootScope.currentUser._id, 'date': today}
		})
		
		var query2 = $http({
		  url: 'http://localhost:3000/api/v1/findMyBookings-part2',
		  method: 'POST',
		  data: {'user':$rootScope.currentUser._id, 'date': today}
		})
		promises.push(query1)
		promises.push(query2)

        return $q.all(promises).then(
            function(response){
				
              return response[0].results.concat(response[1].results)


          }, function(error){
            throw error
            console.log(error);
          })

      },
	findMyInvitations: function(){
          return $http({
		  url: 'http://localhost:3000/api/v1/findMyInvitations',
		  method: 'POST',
		  data: {'user':$rootScope.currentUser._id}
		})

        },
    countMyInvitations: function(){
          return $http({
			  url: 'http://localhost:3000/api/v1/countMyInvitations',
			  method: 'POST',
			  data: {'user':$rootScope.currentUser._id}
          })
	  },
	findMyGameNotPayed: function(){
		  
		var promises = [];
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
		  
		var query1 = $http({
		  url: 'http://localhost:3000/api/v1/findMyGameNotPayed-part1',
		  method: 'POST',
		  data: {'user':$rootScope.currentUser._id, 'date': today}
		})
		
		var query2 = $http({
		  url: 'http://localhost:3000/api/v1/findMyGameNotPayed-part2',
		  method: 'POST',
		  data: {'user':$rootScope.currentUser._id, 'date': today}
		})
		promises.push(query1)
		promises.push(query2)

        return $q.all(promises).then(
            function(response){
				
              return response[0].results.concat(response[1].results)


          }, function(error){
            throw error
            console.log(error);
          })

        },
					   
    acceptInvitation: function(invitation){

            var defer = $q.defer()
            var booking = invitation.booking
            var players = booking.players
            //console.log(players)
            var index = _.findIndex(players,function(p){
              return p.id == $rootScope.currentUser._id
            })
            console.log(index)
            
            //*****************
             var numPlayersCurrent = booking.players != null ? booking.players.length : 0
             var numPlayers = booking.playersNumber
             if (numPlayers == numPlayersCurrent){
              defer.reject("Ooopssss! La Call è già completa! Puoi solo declinare l'invito....") 
             }
            //*****************
             else if (index != -1){
              defer.reject("Utente già iscritto alla partita...")
             }
             else {
				$http({
				  url: 'http://localhost:3000/api/v1/acceptInvitation',
				  method: 'POST',
				  data: {'idInvitation': invitation._id, 'idBooking':booking._id, 'user':$rootScope.currentUser._id}
			    })
				//TODO
                //Parse.Cloud.run('sendPush', {userId:booking.get('user').id,message:"Il tuo invito è stato accettato!"})
                defer.resolve("ok acceptInvitation");
             }
             
             return defer.promise; 
        },
    declineInvitation: function(invitation){
            if (invitation.booking){
				//TODO
				//Parse.Cloud.run('sendPush', {userId:invitation.get('booking').get('user').id,message:"Opsss....Il tuo invito è stato rifiutato!"})
			}
                
		  	return $http({
				  url: 'http://localhost:3000/api/v1/declineInvitation',
				  method: 'POST',
				  data: {'idInvitation': invitation._id}
			    })
            
        },	
    sendMessageBookingUsers: function(booking,messagex){
            var players = booking.players
            _.each(players,function(p){
                console.log("sending Message....")
				//TODO
                //Parse.Cloud.run('sendPush', {userId:p.id,message:messagex}).then(function(success){
              })
            
            if (! booking.callToAction){
                //TODO
				//Parse.Cloud.run('sendPush', {userId:booking.get('user').id,message:messagex})
            }
        },
	courtsView: function(datex,gameType){

            //console.log(datex)
            var ranges = _.range(15, parseInt(config.slotsNumber) + 1);
            var courtsNumber = $rootScope.gameTypes[gameType].courtsNumber
            var courts = _.range(1,parseInt(courtsNumber) + 1)
            return this.findBookingsInDate(datex,gameType)
              .then(function (response){
				  var bookings = response.results
                  //console.log(bookings)
                    var ret = []
                   _.each(ranges,function(r){
                      var row = {}
                      row.range = r
                      row.courts = []
                      courts.forEach(function(courtx){
                          var p = _.filter(bookings, function(item){
                          if (item.ranges.indexOf(r) != -1 && item.court == courtx){
                                return item
                          }

                          })
                          if (p == null)
                            p = []
                          row.courts.push(p)
                      })
                      ret.push(row)
                    })
                   //console.log(ret)
                   return ret

              })
          
        },
	saveNote: function(booking){
          $http({
				  url: 'http://localhost:3000/api/v1/saveNote',
				  method: 'POST',
				  data: {'id': booking._id, 'note':booking.note}
		  })
        },
	getRecharges : function(user){
		  return $http({
				  url: 'http://localhost:3000/api/v1/getRecharges',
				  method: 'GET',
				  data: {'user': $rootScope.currentUser._id}
		  })
     },
	addCharge: function(user,qty){
		  return $http({
				  url: 'http://localhost:3000/api/v1/addCharge',
				  method: 'POST',
				  data: {'user': user._id, 'qty':qty}
		  })

       
        },
    getPayments: function(user){
		  
		  return $http({
				  url: 'http://localhost:3000/api/v1/getPayments',
				  method: 'GET',
				  data: {'user': $rootScope.currentUser._id}
		  })
		  	
        },
    getPaymentsByBooking: function(booking){
		  
		   return $http({
				  url: 'http://localhost:3000/api/v1/getPaymentsByBooking',
				  method: 'GET',
				  data: {'booking': $rootScope.booking._id}
		  })
           
        },
    payQuota : function(booking){
		  return $http({
				  url: 'http://localhost:3000/api/v1/payQuota',
				  method: 'POST',
				  data: {'booking': booking._id, 'circolo':$rootScope.currentUser.circolo._id}
		  })
		  
          
        },
    payTessera: function(user,booking,qty){

          /*KKK Scommentare quando verrà abilitato pagamento tessere
          ed inserire questo option button nella pagina tab account (modal saldare.html):
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          <ion-option-button class="button-balanced" 
                           ng-click="payMyBooking(booking)">
          Paga la tua quota
          </ion-option-button> 

          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          if (! this.checkCreditAvalability(user,qty))
            throw "Credito Insufficiente...."

          var promises = []
          var Payment = Parse.Object.extend("Payment");
          var pay = new Payment();
          pay.set("user", user)
          pay.set("booking", booking)
          pay.set("qty",qty)
          pay.set("type", "tessera")
          var c = user.get('circolo')
          pay.set('circolo',c)
          promises.push(pay.save())
          var nrc = parseInt(user.get('residualCredit')) - parseInt(qty)
          promises.push(Parse.Cloud.run('changeUserField', {userId:user.id,field:"residualCredit",newValue:nrc}))
          return $q.all(promises)*/
		  return $http({
				  url: 'http://localhost:3000/api/v1/payTessera',
				  method: 'POST',
				  data: {'booking': booking._id, 'circolo':$rootScope.currentUser.circolo._id}
		  })
          

        },
	checkCreditAvalability: function (user,qty){

          var residualCredit = user.residualCredit
          console.log(user)
          console.log(residualCredit)
          if (residualCredit != null && residualCredit >= parseInt(qty)){
            return true
          }
          return false

        },
	deletePayment: function(payment){
		  
		  return $http({
				  url: 'http://localhost:3000/api/v1/deletePayment',
				  method: 'POST',
				  data: {'payment': payment._id}
		  })
          
        },
	enabling: function(user){
	   return $http({
			  url: 'http://localhost:3000/api/v1/enabling',
			  method: 'POST',
			  data: {'user': user._id}
	  })

	},
	changeUserLevel: function(user){
		  	var level = user.level
			return $http({
			  url: 'http://localhost:3000/api/v1/changeUserLevel',
			  method: 'POST',
			  data: {'user': user._id, 'level':level}
	  })
            
      },
	payMyBooking: function(booking){
          return this.payTessera($rootScope.currentUser,booking,1).then(
            function(ret){
              return $rootScope.currentUser
          })
        },
	//Se l'utente in sessione ha ruolo admin o segreteria elimino e basta
    //KKK eliminare le invitations
    //Se l'utente in sessione è l'organizzatore la partita viene cancellata
    // Se l'utente in sessione è stato invitato viene tolto dai players
	deleteBooking: function(booking){
		  
		return $http({
			  url: 'http://localhost:3000/api/v1/deleteBooking',
			  method: 'POST',
			  data: {'booking': booking._id, 'role': $rootScope.currentUser.role, 'user': $rootScope.currentUser._id}
	  	})
		  
      },
	setCallToAction : function(booking){
		  
		    return $http({
			  url: 'http://localhost:3000/api/v1/setCallToAction',
			  method: 'POST',
			  data: {'booking': booking._id, 'user': $rootScope.currentUser._id, 'playersNumberMissing': booking.playersNumberMissing}
	  		})
            
        },
	findPlayersWithName:function(namex){
		  
		  return $http({
			  url: 'http://localhost:3000/api/v1/findPlayersWithName',
			  method: 'POST',
			  data: {'name': namex, 'user':$rootScope.currentUser, 'circolo': $rootScope.currentUser.circolo}
	  		})

        

        },  
	invite:function(userIdToInvite,email, bookingIdCalled){
		  return $http({
			  url: 'http://localhost:3000/api/v1/invite',
			  method: 'POST',
			  data: {'userIdToInvite': userIdToInvite, 'email':email,'bookingIdCalled': bookingIdCalled}
	  		})
		  
            
        },
		
  	findInvitationAlredySentForBooking: function(bookingId){

           return $http({
			  url: 'http://localhost:3000/api/v1/findInvitationAlredySentForBooking',
			  method: 'POST',
			  data: {'bookingId': bookingId}
	  		})

        },   
	createInstallationObject: function(){


            var push = new Ionic.Push({
              "debug": false,
              "onNotification": function(notification) {
                var payload = notification.payload;
                console.log('notifica.....')
                $ionicLoading.show({ template: notification.text, duration:3000 });

                //alert(notification, payload);
              },
              "onRegister": function(data) {
                console.log(data.token);
              },
              "pluginConfig": {
                "ios": {
                  "badge": true,
                  "sound": true
                 },
                 "android": {

                 }
              } 
            });
			if ($rootScope.platform == 'ios' || $rootScope.platform == 'android'){
				push.register(function(token) {
                console.log("Device token:",token.token);
				window.localStorage['deviceToken'] = data.token
				return $http({
					url: 'http://localhost:3000/registerToken',
					method: 'POST',
					data: {'user':$rootScope.currentUser._id, 'deviceToken':token.token, 'jwtToken': window.localStorage['token'],'deviceType':$rootScope.platform},
					headers: {
					   'Content-Type': 'application/json'
					 }
				 	})  
            	});
			}
			else{
				return $http({
					url: 'http://localhost:3000/registerToken',
					method: 'POST',
					data: {'user':$rootScope.currentUser._id, 'deviceToken':'web access', 'jwtToken': window.localStorage['token'],'deviceType':$rootScope.platform},
					headers: {
					   'Content-Type': 'application/json'
					 }
				 })  
				
			}
            

        },
	setPreferred: function(user){
		  
		  return $http({
			  url: 'http://localhost:3000/api/v1/setPreferred',
			  method: 'POST',
			  data: {'user': $rootScope.currentUser._id, 'userToadd': user._id}
	  		})
               

        },
    isPreferred: function(user){
            var preferences = $rootScope.currentUser.preferences
            var index = _.findIndex(preferences,function(p){
                return p.id == user.id
            })
            return (index != -1)

        },
	getPreferred:function(){
		
		 return $http({
			  url: 'http://localhost:3000/api/v1/getPreferred',
			  method: 'POST',
			  data: {'user': $rootScope.currentUser._id}
	  		})

        },
	setStatus:function(message){
            var user = JSON.parse(window.localStorage['user'])
			user.status = message
			window.localStorage['user'] = JSON.stringify(user)
			$rootScope.currentUser = user
			return $http({
			  url: 'http://localhost:3000/api/v1/setStatus',
			  method: 'POST',
			  data: {'user': $rootScope.currentUser._id, 'status': message}
	  		})


        },
    getPlayersByLevel: function(){
		
		return $http({
			  url: 'http://localhost:3000/api/v1/getPlayersByLevel',
			  method: 'GET',
			  data: {'circolo': $rootScope.currentUser.circolo, 'level': $rootScope.currentUser.level}
	  		})
             var query = new Parse.Query(Parse.User)
            query.equalTo('level',Parse.User.current().get('level'))
            query.equalTo('circolo',Parse.User.current().get('circolo'))
            return query.find()

        },
		
		deleteObjectFromCollection: function(item, collection){
          _.remove(collection, function(object){
              return object._id == item._id
          })
        }
		//*****************TODO**********************

	  /*
        statsByBookingAndMonth:function(month,year){
          //console.log(month)
          var daysInMonth = Utility.getDaysInMonth(month,year);
          var startDate = new Date(year + "/" + (parseInt(month) +1) + "/" + 1);
          var endDate =new Date( year + "/" + (parseInt(month) +1) + "/" + daysInMonth);
          endDate.setHours(23)
          endDate.setMinutes(59)

          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);
          query.greaterThanOrEqualTo("date", startDate);
          query.lessThanOrEqualTo("date", endDate);
          var c = Parse.User.current().get('circolo')
          query.equalTo('circolo',c)

          return query.count()
        },
        statsByBookingAndYear:function(year){

          var myContext = this
          var promises = []
          var ranges = _.range(0, 12);
          _.each(ranges, function(r){

            promises.push(myContext.statsByBookingAndMonth(r,year))

          })

          return $q.all(promises)
        },
        statsByPaymentsAndMonth:function(month,year,type){
          var daysInMonth = Utility.getDaysInMonth(month,year);

          var startDate = new Date(year + "/" + (parseInt(month) +1) + "/" + 1);
          var endDate =new Date( year + "/" + (parseInt(month) +1) + "/" + daysInMonth);
          endDate.setHours(23)
          endDate.setMinutes(59)
          var Payment = Parse.Object.extend("Payment");
          var query = new Parse.Query(Payment);
          query.greaterThanOrEqualTo("createdAt", startDate);
          query.lessThanOrEqualTo("createdAt", endDate);
          query.equalTo("type", type);
          var c = Parse.User.current().get('circolo')
          query.equalTo('circolo',c)

          return query.count()
        },
        statsByPaymentAndYear:function(year){

          var myContext = this
          var promises = []


          var ranges = _.range(0, 12);
          _.each(ranges, function(r){

            promises.push(myContext.statsByPaymentsAndMonth(r,year,'quota'))

          })
          _.each(ranges, function(r){

            promises.push(myContext.statsByPaymentsAndMonth(r,year,'tessera'))

          })

          return $q.all(promises)
        },
        statsByUser:function(){

          var query = new Parse.Query(Parse.User);
          //query.equalTo('enabled',false)
          var c = Parse.User.current().get('circolo')
          query.equalTo('circolo',c)
          return query.count()

        },
        deleteParseObjectFromCollection: function(item, collection){
          _.remove(collection, function(object){
              return object.id == item.id
          })
        },
		*/
		
	  
      /*
	  findAvalabilities: function(month,year,gameT){
        var avalabilities = [];
        return this.findBookings (month,year)
        .then(
          function(bookings){
            var daysInMonth = Utility.getDaysInMonth(month,year)
            //In una giornata ci sono 48 slot prenotabili....
            var days = _.range(1,parseInt(daysInMonth) +1);
            var ranges = _.range(1, parseInt(config.slotsNumber) + 1);

            _.each(days,function(d){
                var avalability = {day:d, avalaibleRanges: []};
                _.each(ranges, function(r){
                  //var px = _.where(bookings,{date:d, ranges:[r],gameType: gameT});

                  var px = _.filter(bookings, function(item){

                    if (item.get('date').getDate() == d &&
                        item.get('ranges').indexOf(r) != -1 && item.get('gameType') == gameT){
                      return item
                    }
                  })

                  var num = $rootScope.gameTypes[gameT].courtsNumber

                  if (px.length < num){

                      avalability.avalaibleRanges.push(r);
                  }
                })
                avalabilities.push(avalability);
            })
            return avalabilities;
        }, function(error){
            Utility.handleParseError(error);
        })
      },
      findaAvalaibleRangesInDate: function(date,gameT){

        
        var avalaibleRanges = [];
        return this.findBookingsInDate (date,gameT)
        .then(
          function(bookings){

            var myranges = _.range(1, parseInt(config.slotsNumber) + 1);
            var num = $rootScope.gameTypes[gameT].courtsNumber

            _.each(myranges, function(r){
              var px =  _.filter(bookings,function(item){

                  if (item.get('ranges').indexOf(r) != -1 )
                      return item;
              });
              
              if (px.length < num){
                  avalaibleRanges.push(r);
              }
            })
            
            return avalaibleRanges;
        }, function(error){
            
            console.log(error);
            Utility.handleParseError(error);
        })
      },
      getCoachAvalabilitiesFilteredByBookings:function(month,year,maestroId, typeG){

            var courtsAvalabilities = []
            var avalabilities = []
            var myContext = this;
            $ionicLoading.show({
              template: 'Loading...'
            });


            console.log('maestroId:' + maestroId);
            return this.findAvalabilities(month,year,typeG)
            .then(
                function(results){

                  //formato: [{day:d, avalaibleRanges: []}]
                  courtsAvalabilities = results
                  //console.log(results);


                }, function(error){
                  console.log(error);
                  Utility.handleParseError(error);
                })
            .then(
              function(obj){
                return myContext.getDisponibilitaCoach(month,year,maestroId)
            }, function(error){
              console.log(error);
                Utility.handleParseError(error);
            })
            .then(
              function(disponibilitaCoach){

                console.log(disponibilitaCoach);
                console.log(courtsAvalabilities);

                _.each(disponibilitaCoach,function (d){
                  _.each(d.get('ranges'),function(r){
                      var x = _.filter(courtsAvalabilities, function(item){

                      if (item.day == d.get('date').getDate() &&
                          item.avalaibleRanges.indexOf(r) != -1){
                        return item
                      }
                    })
                    if (x.length > 0)
                      avalabilities.push({day:d.get('date').getDate(),range:r});
                  })
                })
                //console.log(avalabilities);
                $ionicLoading.hide()
                return avalabilities;

            }, function(error){
                $ionicLoading.hide()
                console.log(error);
                Utility.handleParseError(error);
            })
    
      },
      getDisponibilitaCoach:function(month,year,maestroId){

        //var maestro = null;

        var Maestro = Parse.Object.extend("Maestro");

        console.log(maestroId);
        var maestro = new Maestro();
        maestro.id = maestroId
        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) + 1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) + 1) + "/" + daysInMonth);

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        query.equalTo("maestro",maestro);
        return query.find()

      },
      getDisponibilitaCoachForCalendar:function(month,year,maestroId){
        var avalabilities = []

        var Maestro = Parse.Object.extend("Maestro");

        //console.log(maestroId);
        var maestro = new Maestro()
        maestro.id = maestroId
        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) + 1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) + 1) + "/" + daysInMonth);

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        query.equalTo("maestro",maestro);
        return query.find()
        .then(
          function(disponibilitaCoach){
            _.each(disponibilitaCoach,function (d){
              var ranges = []
              _.each(d.get('ranges'),function(r){
                  ranges.push(r)
              })
              avalabilities.push({day:d.get('date').getDate(),range:ranges});
            })
            //console.log(avalabilities);
            return avalabilities;

        }, function(error){
          console.log(error);
        })


      },
     
      getCoach: function(objectId){
        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        return query.get(objectId).then(
          function(obj){
            $ionicLoading.hide();
            return obj.toJSON();
          },
          function (error){
            Utility.handleParseError(error);
          }
        )
      },
      addDisponibilitaCoach:function(obj){
        $ionicLoading.show({
          template: 'Loading...'
        });

        var currentUser = Parse.User.current();
        var maestro = currentUser.get('maestro');

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var ca = new CoachAvalability();
        ca.set('date',obj.date);
        ca.set('ranges',obj.ranges);
        ca.set('maestro',maestro);
        return ca.save(null)
        .then(
          function(obj){
            $ionicLoading.hide();
            return obj;
        }, function(error){
          $ionicLoading.hide();
            Utility.handleParseError(error);
        })
      },
      deleteDisponibilitaCoach:function(date){

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        query.equalTo("maestro", Parse.User.current().get('maestro'));
        query.equalTo("date",date)
        return query.first()
        .then(
          function(obj){
            obj.destroy()

        }, function(error){
          console.log(error);
        })


        c.destroy()

      },
	  */
	

    }
	
  }
)
.factory('TokenInterceptor', function($q, $window) {
  return {
    request: function(config) {
		if (config.url.indexOf('openweathermap') != -1)
			return config
		config.headers = config.headers || {};
		if (window.localStorage['token']){
			console.log('TokenInterceptor')
			config.headers['X-Access-Token'] = window.localStorage['token'];
			config.headers['X-Device-Token'] = window.localStorage['deviceToken'];
			config.headers['X-Key'] = JSON.parse(window.localStorage['user']).email;
			//console.log(JSON.parse(window.localStorage['user']).username)
			config.headers['Content-Type'] = "application/json";
			//console.log(window.localStorage['token'])
		}
		//console.log(config)
		return config
		
    },

    response: function(response) {
	  //console.log(response)
	  response.results = response.data.data
      return response || $q.when(response);
    }
  };
})

.factory('Utility',function($state,$ionicLoading){

  return {
    /* Because day 0 equates to the last day of the previous month the number returned is effectively the number of days for the month we want.
    */
    getDaysInMonth: function(month,year) {
      return new Date(year, month + 1, 0).getDate();
    },
    getDayOfFirstDateOfMonth: function(month,year){
      //            1     2     3     4     5     6     0
      var days = ['L','Ma','Me','G','V','S','D'];
      var date = new Date (year, month, 1);
      //alert('date.getDay()'+ date.getDay());
      return days[(date.getDay() + 6 ) % 7];
      //return date.getDay();
    },
    getCalendar: function(month,year){
      var weekDays = ['L','Ma','Me','G','V','S','D'];
      var firstDateOfMonth = this.getDayOfFirstDateOfMonth(month,year);
      //alert ('firstDateOfMonth'  + firstDateOfMonth);
      var pos = weekDays.indexOf(firstDateOfMonth);
      var daysInMonth = this.getDaysInMonth(month,year);
      //alert ('daysInMonth'+ daysInMonth);
      var myDay = 1;
      var weeks = [];

      for (var row = 1; row<=6; row++){
        var week = [];
        if (row == 1){
          _.each( _.range(0,pos),function (value, key, list){
                  week.push('-');
                })
          _.each( _.range(pos,7),function (value, key, list){
                  week.push(myDay);
                  myDay++;
                })
        }
        if ( row != 1 && myDay <= daysInMonth){
          _.each( _.range(0,7),function (value, key, list){
                  myDay <= daysInMonth ? week.push(myDay) : week.push('-');
                  myDay++;
                })
        }
        weeks.push (week);
      }
      return weeks;

    },
    getWeekdayFromToday: function(){
      
      var ret = []
      moment.locale('it');
      for (i=0; i <= 7 ; i++) {
          var day = {value:moment().startOf('day').add(i, 'days'),label:moment().add(i, 'days').format('dd DD/MM/GG')}
          ret.push(day)
     };
       // console.log(ret)
        return ret
    },
      
     
    getHoursFromRanges: function(ranges){
      var ret = "";
      _.each(ranges,function(r){
        var end = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        r  = r - 0.5
        var start = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        ret += "  " + start + "-" + end;
      })
      return ret;
    },
    getHours:function(){
        var ranges = []
        for (i = 15 ; i <=47 ; i++){
            var hm = this.getHourMinuteFromSlot(i)[0] + ":" + this.getHourMinuteFromSlot(i)[1]
            ranges.push({value:i, label:hm})
        }      
        return ranges 
    
    },
      
      getRangeFromHour: function(hour, minute){
        if (minute != '0')
            return ((hour * 2)  + 2)
        return ((hour * 2) + 1)
      },

    getHourFromSlot : function(r){
      var ret = "";
      
        var end = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        r  = r - 0.5
        var start = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        ret += "  " + start + "-" + end;
  
      return ret;
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
    },

    getCourtNameByIndex: function(index,gameType ){
      
    var game = $rootScope.gameTypes[parseInt(gameType)]
    //console.log(gameType);
    return game.courtsNames[parseInt(court)-1]

    },
    
    

    formatDate: function formatDate(d) {
      var dd = d.getDate()
      if ( dd < 10 ) dd = '0' + dd
      var mm = d.getMonth()+1
      if ( mm < 10 ) mm = '0' + mm
      var yy = d.getFullYear() % 100
      if ( yy < 10 ) yy = '0' + yy
      return dd+'.'+mm+'.'+yy
    },
    handleParseError: function (err) {
        console.log(err);

        switch (err.code) {
          case Parse.Error.INVALID_SESSION_TOKEN:
            Parse.User.logOut();
            $state.go('login');
            break;
          default:
            console.log(err);
          }
}
  };
})

.factory('weatherService', ['$http', '$q', function ($http, $q){
      function getWeatherForecast5Days () {
        var deferred = $q.defer();
        $http.get('http://api.openweathermap.org/data/2.5/forecast?q=roma,it&units=metric&appid=b76dfef9065842dab1454f9c5c92e340')
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(err){
            console.log('Error retrieving meteo!!!');
            deferred.reject(err);
          });
        return deferred.promise;
      }





      return {
        getWeather5Days: getWeatherForecast5Days

      };
    }]);
