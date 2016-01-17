angular.module('starter.services', [])

.factory('MyObjects', function(Utility,$ionicLoading, $rootScope, config,$q) {

    return {

      getUsersToEnableTest: function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('enabled',false)
        console.log('getUsersToEnable...');
        return query.find()

      },

      getCircoli: function(){
        
        var Circolo = Parse.Object.extend("Circolo");
        var query = new Parse.Query(Circolo);
        return query.find()
        .then(
          function(results){
            _.each(results,function(item){
                if (Parse.User.current() && Parse.User.current().get('subscriptions') != null &&
            Parse.User.current().get('subscriptions').indexOf(item.id) != -1){

              item.manage = "unsubscribe"
            }
            else {
              item.manage = "subscribe"
            }
            })
            
            return results
        }, function(error){
          throw error
          console.log(error);
        })

      },

      requestForSubscription: function(circolo){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var defer = $q.defer()
        Parse.Cloud.run('requestForSubscription', {circoloId:circolo.id,userName:Parse.User.current().get('nome'),userId:Parse.User.current().id})
        .then(
          function(response){
            defer.resolve(response);
            $ionicLoading.hide()
        }, function(error){
          defer.reject(error)
          console.log(error);
          $ionicLoading.hide()
        })
        return defer.promise

      },

      getUsersFromSubscribtionRequest:function(){


        var SubscriptionRequest = Parse.Object.extend("SubscriptionRequest");
        var query = new Parse.Query(SubscriptionRequest);
        query.equalTo('circolo',Parse.User.current().get('circolo'))
        query.include("user")
        return query.find()
        .then(
          function(results){
            console.log(results);
            return _.pluck(results,"attributes.user")
        }, function(error){
          console.log(error);
        })


      },

      getUsersToEnable: function(){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var promises = []
        var myContext = this
        var c = Parse.User.current().get('circolo');
        var query = new Parse.Query(Parse.User);
        query.equalTo('enabled',false)
        query.equalTo('circolo',c)
        console.log('getUsersToEnable...');
        promises.push (query.find())
        promises.push (myContext.getUsersFromSubscribtionRequest())

        return $q.all(promises).then(
            function(results){
              $ionicLoading.hide()
              return _.flatten(results)


          }, function(error){
            $ionicLoading.hide()
            console.log(error);
          })


      },

      enableUser: function(user){

        ////circoloId è il circolo dell'amministratore che concede l'abilitazione....
        return Parse.Cloud.run('enableUser', {userId:user.id,circoloId:Parse.User.current().get('circolo').id})

      },

      getDashboardText : function(){
        
        var text = []
        var c = Parse.User.current().get('circolo');
        var Dashboard = Parse.Object.extend("Dashboard");
        var query = new Parse.Query(Dashboard);
        query.equalTo('circolo',c)
        return query.find()
        .then(
          function(results){
            var item = results[0];
            //console.log(results);
            text.push(item.get('area1'))
            text.push(item.get('area2'))
            text.push(item.get('area3'))
            //$ionicLoading.hide()
            return text;

        }, function(error){
          
          Utility.handleParseError(error);
        })
      },

      saveDashboardText: function (index,text){
        var i = parseInt(index) + 1

        var Dashboard = Parse.Object.extend("Dashboard");
        var query = new Parse.Query(Dashboard);
        var c = Parse.User.current().get('circolo');
        query.equalTo('circolo',c)
        return query.find()
        .then(
          function(results){
            var item = results[0];

            return item;

        }, function(error){
            Utility.handleParseError(error);
        })
        .then(
          function(item){

            item.set('area'+i, text)
            return item.save()

        }, function(error){
            Utility.handleParseError(error);
        })

      },


      checkBeforeCreateBooking: function(date,ranges,gameT){
        
        console.log(ranges)

        var defer = $q.defer()
        var courtsAvalaivable = []
        var courtsNumber = $rootScope.gameTypes[gameT].courtsNumber

        var courts = _.range(1,parseInt(courtsNumber) + 1)
        return this.findBookingsInDate(date,gameT)
        .then(
          function(bookings){
            courts.forEach(function(court){
              //console.log("court:" + court);
              var avalaible = true
              ranges.forEach(function(r){
                var p = _.filter(bookings, function(item){
                  if (item.get("ranges") != null &&
                      item.get("ranges").indexOf(r) != -1 &&
                      item.get("court") != null &&
                      item.get("court") == court){
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
            if (courtsAvalaivable.length > 0){
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
        console.log(obj)
        return this.checkBeforeCreateBooking(obj.date,obj.ranges,obj.gameType)
        .then(
          function(courtsAvalaivable){
            var Booking = Parse.Object.extend("Booking");
            var book = new Booking();
            book.set("user", Parse.User.current());
            book.set("circolo", Parse.User.current().get('circolo'));
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
                book.add('players',Parse.User.current())

            }
            book.set("gameType",obj.gameType.toString());
            book.set("note",obj.note);
            book.set("payed",false);
            book.set("playersNumber",obj.playersNumber)

            /*var ps = {quote:0,tessere:0}
            book.set("payments",ps)*/

            var maestroId = obj.maestro != null ? obj.maestro.id : -1


            //console.log(maestroId);
            if (maestroId != -1){
              var Maestro = Parse.Object.extend("Maestro");
              var maestro = new Maestro()
              maestro.id = maestroId
              book.set('maestro',maestro)
            }
            return book.save(null)

        }, function(error){

          console.log(error);
        })
      },

      setBookingPayed: function(booking){

        booking.set('payed',true);
        return booking.save();

      },
      /*findBookingsForSegreteria: function(date){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var defer = $q.defer()
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        var ret = {}

        var myContext = this

        myContext.findBookingsToPayBeforeDate(today)
        .then(
          function(obj){
            console.log(obj)
            ret.bookingsToPayBeforeToday = obj;
            $ionicLoading.hide();
        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })

        //*****************
        var gameTypes = $rootScope.gameTypes

        ret.bookingsInDate = []
        _.each(gameTypes, function(item,index){

          var i = index
          myContext.findBookingsInDate(date,i.toString())
          .then(
            function(obj){

              ret.bookingsInDate  = ret.bookingsInDate.concat (obj);
              $ionicLoading.hide();
          }, function(error){
            console.log(error);
            defer.reject(error)
            $ionicLoading.hide();
          })

          defer.resolve(ret)
        })

        return defer.promise;
        //*****************



      },*/
      findBookings: function(month,year){

        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) +1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) +1) + "/" + daysInMonth);

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        var c = Parse.User.current().get('circolo')
        query.equalTo('circolo',c)
        var ret = [];
        return query.find()
      },
      findBookingsInDate: function(date,gameT){

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.equalTo("date", date);
        query.equalTo("gameType",gameT.toString());
        var c = Parse.User.current().get('circolo')

        query.equalTo('circolo',c)
        query.include('players')
        query.include('user')

        return query.find()
      },
      findBookingsToPayBeforeDate: function(date){
        console.log(date)
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.lessThanOrEqualTo("date", date);
        query.ascending("date");
        query.equalTo("payed", false);
        var c = Parse.User.current().get('circolo')
        query.equalTo('circolo',c)
        query.include('user')
        query.include('players')

        return query.find()
      },
      //Se sono un maestro prende le prenotazioni che mi riguardano
      //altrimenti prende le prenotazione dell'utente in sessione
      findMyBookings: function(){
        
        var promises = [];

        var Booking = Parse.Object.extend("Booking");
        var query1 = new Parse.Query(Booking);
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        query1.greaterThanOrEqualTo("date", today);
        var user = Parse.User.current()
        /*if (user.get('maestro') != null){
          query1.equalTo("maestro", user.get('maestro'));
        }*/
        query1.equalTo("user", user );
        //query1.equalTo('callToAction', false);
        query1.ascending("date");
        query1.include('players');
        query1.include('user')
        promises.push(query1.find())

        var query2 = new Parse.Query(Booking);
        //Escludo i risultati precedenti....
        query2.notEqualTo("user", user );
        //Cerco le prenotazioni alle quali sono stato invitato o mi sono unito....
        query2.equalTo('players',Parse.User.current())
        query2.greaterThanOrEqualTo("date", today);
        query2.include('players')
        query2.include('user')
        promises.push(query2.find())


        return $q.all(promises).then(
            function(results){
              
              return _.flatten(results)

              return

          }, function(error){
            throw error
            console.log(error);
          })

      },
      //Se l'utente in sessione ha ruolo admin o segreteria elimino e basta
      //KKK eliminare le invitations
      //Se l'utente in sessione è l'organizzatore la partita viene cancellata
      // Se l'utente in sessione è stato invitato viene tolto dai players
      deleteBooking: function(item){
        if (Parse.User.current().get('role') == 'admin' || Parse.User.current().get('role') == 'segreteria'){
          var Booking = Parse.Object.extend("Booking");
          var b = new Booking();
          b.id = item.id
          //console.log(b);
          return b.destroy();  
        }
        var players = item.get('players')
        var Booking = Parse.Object.extend("Booking");
        if (item.get('user').id == Parse.User.current().id){
          var b = new Booking();
          b.id = item.id
          //console.log(b);
          return b.destroy();  
        }
        else{
          
          var index = _.findIndex(players,function(p){
            return p.id == Parse.User.current().id
          })
          
          players.splice(index,1);
          item.set('players',players)
          
          return item.save()

        }
        


      },
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
                //************
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
      getCoaches: function(){

        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        var c = Parse.User.current().get('circolo')
        query.equalTo('circolo',c)
        return query.find()
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

      addCallToActionPlayer: function(cta){


          var defer = $q.defer()
          var user = Parse.User.current();
          var numPlayers = cta.get('playersNumber')
          if (cta.get("players").length == numPlayers ){
            defer.reject('Partita già al completo!')
          }
          else{
            var players = cta.get('players')
            if (! _.find(players,{id:user.id})){
              cta.add('players',user);
              cta.save()
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

      /*addCallToActionPlayer: function(cta){


          var defer = $q.defer()
          var user = Parse.User.current();
          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);

          return query.get(cta.id)
          .then(
            function(cta){

              //var actualGame = $rootScope.gameTypes[cta.get('gameType')]
              //var numPlayers = parseInt(actualGame.numberPlayers)
              var numPlayers = cta.get('playersNumber')
              if (cta.get("players").length == numPlayers ){
                defer.reject('Partita già al completo!')
              }
              else{
                var players = cta.get('players')
                var x = _.find(players,{id:user.id})
                if (!x){
                  cta.add('players',user);
                  cta.save()
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
          }, function(error){
            
            Utility.handleParseError(error);

          })
        },*/
        findCallToAction:function(){

          var today = new Date();
          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0);
          today.setMilliseconds(0);
          
          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);
          query.greaterThanOrEqualTo("date", today);
          query.equalTo("callToAction", true)
          var c = Parse.User.current().get('circolo')
          query.equalTo('circolo',c)
          query.include('user')
          query.include('players')
          query.limit(30);
          query.ascending("date");
          return query.find()
          .then(
            function(results){
              
              return results
          }, function(error){
            
            console.log(error);
          })


        },
        findPlayersWithName:function(namex){

         
          var query = new Parse.Query(Parse.User);
          query.equalTo('circolo',Parse.User.current().get('circolo'))
          query.contains("nome", namex.toLowerCase());
          query.descending("createdAt")
          query.limit(20)
          return query.find()

        },

        /*invite:function(userIdToInvite,email, bookingIdCalled){
          console.log('invite service');
          var defer = $q.defer()

          Parse.Cloud.run('invite', {user:userIdToInvite,mail: email, booking: bookingIdCalled})
          .then(
            function(response){
              defer.resolve('ok')
              return "ok"
              //$ionicLoading.hide()


          }, function(error){
            defer.reject(error)
            console.log(error);
            //$ionicLoading.hide()
          })
          return defer.promise

        },*/
        invite:function(userIdToInvite,email, bookingIdCalled){
            var promises = []
            console.log('invite service');
            var user = new Parse.User()
            user.id = userIdToInvite
            var Booking = Parse.Object.extend("Booking");
            var booking = new Booking()
            booking.id = bookingIdCalled
            var query1 = new Parse.Query(Booking)
            query1.equalTo('objectId',bookingIdCalled)
            query1.equalTo('players',user)
            promises.push(query1.find())
            
            var InvitationRequest = Parse.Object.extend("InvitationRequest");
            var query2 = new Parse.Query(InvitationRequest)
            query2.equalTo('user',user)
            query2.equalTo('booking',booking)
            promises.push(query2.find())
            $q.all(promises).then(function(results){
                    
                if (results[0].length == 0 && results[1].length == 0){
                      var InvitationRequest = Parse.Object.extend("InvitationRequest");
                      var ir = new InvitationRequest()
                      ir.set('user',user)
                      ir.set('booking',booking)
                      ir.save()
                      Parse.Cloud.run('sendPush', {userId:userIdToInvite,message:"Sei stato invitato ad una partita! Vai nella pagina account, sezione inviti, per scoprire chi è il mittente!"})
                }
                else
                    console.log("L'utente è gia della partita! oppure è già stato invitato....")
                            
            })
        },
        
        findInvitationAlredySentForBooking: function(bookingId){

          var Booking = Parse.Object.extend("Booking");
          var booking = new Booking()
          booking.id = bookingId


          var InvitationRequest = Parse.Object.extend("InvitationRequest");
          var query = new Parse.Query(InvitationRequest)
          query.equalTo('booking',booking)
          query.include('user')
          return query.find();

        },

        findMyInvitations: function(){
          var InvitationRequest = Parse.Object.extend("InvitationRequest");
          var query = new Parse.Query(InvitationRequest)
          query.equalTo('user',Parse.User.current())
          query.include('booking')
          query.include('booking.players')
          query.include('booking.user')
          return query.find()



        },

        countMyInvitations: function(){
          var InvitationRequest = Parse.Object.extend("InvitationRequest");
          var query = new Parse.Query(InvitationRequest)
          query.equalTo('user',Parse.User.current())
          return query.count()
        },

            acceptInvitation: function(invitation){

            var defer = $q.defer()
            var booking = invitation.get('booking')
            var players = booking.get('players')
            //console.log(players)
            var index = _.findIndex(players,function(p){
              return p.id == Parse.User.current().id
            })
            console.log(index)
            if (index != -1){
              defer.reject("Utente già iscritto alla partita...")
            }
            else{
                booking.add('players',Parse.User.current())
                booking.save()
                invitation.destroy()
                Parse.Cloud.run('sendPush', {userId:booking.get('user').id,message:"Il tuo invito è stato accettato!"})
                defer.resolve("ok acceptInvitation");
            }
            return defer.promise; 
        },

        declineInvitation: function(invitation){
            if (invitation.get('booking'))
                Parse.Cloud.run('sendPush', {userId:invitation.get('booking').get('user').id,message:"Opsss....Il tuo invito è stato rifiutato!"})
            return invitation.destroy()
        },
        
        sendMessageBookingUsers: function(booking,messagex){
            var players = booking.get('players')
            _.each(players,function(p){
                console.log("sending Message....")
                Parse.Cloud.run('sendPush', {userId:p.id,message:messagex}).then(function(success){
                    console.log("message ok")
                },function(error){
                    console.log(error)
                })
            })
        },

        courtsView: function(datex,gameType){

            //console.log(datex)
            var ranges = _.range(15, parseInt(config.slotsNumber) + 1);
            var courtsNumber = $rootScope.gameTypes[gameType].courtsNumber
            var courts = _.range(1,parseInt(courtsNumber) + 1)
            return this.findBookingsInDate(datex,gameType)
              .then(function (bookings){
                  //console.log(bookings)
                    var ret = []
                   _.each(ranges,function(r){
                      var row = {}
                      row.range = r
                      row.courts = []
                      courts.forEach(function(courtx){
                          var p = _.filter(bookings, function(item){
                          if (item.get("ranges").indexOf(r) != -1 && item.get("court") == courtx){
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
          console.log('noteToSave')
          var newNote = booking.note
          booking.set("note", newNote);
          console.log(booking)
          booking.save(null)
        },

      
        getRecharges : function(user){

          var Recharge = Parse.Object.extend("Recharge");
          var query = new Parse.Query(Recharge);
          query.equalTo("user", user)
          query.descending("createdAt")
          return query.find()

        },

        addCharge: function(user,qty){

          var promises = []
          //Aggiornare residualCredit di User
          var Recharge = Parse.Object.extend("Recharge");
          var r = new Recharge()
          r.set("user",user)
          r.set("qty",parseInt(qty))
          promises.push(r.save())
          var nrc = parseInt(user.get('residualCredit')) + parseInt(qty)
          promises.push(Parse.Cloud.run('changeUserField', {userId:user.id,field:"residualCredit",newValue:nrc}))
          return $q.all(promises)


        },

        getPayments: function(user){
            var Payment = Parse.Object.extend("Payment");
            var query = new Parse.Query(Payment);
            query.equalTo("user", user)
            query.include("booking")
            query.descending("createdAt")
            //query.limit(30);
            return query.find()
        },

        getPaymentsByBooking: function(booking){
            var Payment = Parse.Object.extend("Payment");
            var query = new Parse.Query(Payment);
            query.equalTo("booking", booking)
            query.descending("createdAt")
            query.include("user")
            query.include("booking")
            
            return query.find()
        },

        /*payBooking: function(booking,type,qty){
          //console.log(booking)
          var ps = booking.get('payments')
          //console.log(booking)
          //console.log(booking.get('payments')[type])
          var x = parseInt(booking.get('payments')[type]) + parseInt(qty)
          ps[type] = x
          //console.log(x)
          booking.set('payments',ps);
          return booking.save();
          //console.log("payment")
        },*/

        payQuota : function(booking){
          var Payment = Parse.Object.extend("Payment");
          var pay = new Payment();
          pay.set("booking", booking)
          pay.set("type", "quota")
          pay.set("qty",1)
          var c = Parse.User.current().get('circolo')
          pay.set('circolo',c)
          return pay.save()
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
          var Payment = Parse.Object.extend("Payment");
          var pay = new Payment();
          pay.set("booking", booking)
          pay.set("qty",qty)
          pay.set("type", "tessera")
          var c = Parse.User.current().get('circolo')
          pay.set('circolo',c)
          return pay.save()

        },

        checkCreditAvalability: function (user,qty){
          
          var residualCredit = user.get('residualCredit')
          console.log(user)
          console.log(residualCredit)
          if (residualCredit != null && residualCredit >= parseInt(qty)){
            return true
          }
          return false

        },

        deletePayment: function(payment){
          //console.log(payment)
          var promises = []
          var user = payment.get('user')
          var qty = payment.get('qty')
          var booking = payment.get('booking')
          promises.push(payment.destroy())
          if (user != null){
          var nrc = parseInt(user.get('residualCredit')) + parseInt(qty)
          promises.push(Parse.Cloud.run('changeUserField', {userId:user.id,field:"residualCredit",newValue:nrc}))
          }
          return $q.all(promises)
           
        },

        enabling: function(user){
            var newEnableState = ! user.get("enabled") 
            return Parse.Cloud.run('changeUserField', {userId:user.id,field:"enabled",newValue:newEnableState})
        },

        changeUserLevel: function(user){
            
            return Parse.Cloud.run('changeUserField', {userId:user.id,field:"level",newValue:user.get('level')})
        },

        findMyGameNotPayed: function(){
          
          var today = new Date();
          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0);
          today.setMilliseconds(0);
            

          var promises = []
          var user = Parse.User.current() ;
          var Booking = Parse.Object.extend("Booking");
          var query1 = new Parse.Query(Booking);
          query1.equalTo("user", user );
          //query1.equalTo('callToAction', false);
          query1.ascending("date");
          query1.equalTo('payed',false)
          query1.lessThanOrEqualTo("date", today);
          query1.include('players');
          query1.include('user')
          promises.push(query1.find())

          var query2 = new Parse.Query(Booking);
          //Escludo i risultati precedenti....
          query2.notEqualTo("user", user );
          //Cerco le prenotazioni alle quali sono stato invitato o mi sono unito....
          query2.equalTo('players',user)
          query2.equalTo('payed',false)
          query2.include('players');
          query2.include('user')
          query2.lessThanOrEqualTo("date", today);
          query2.ascending("date")
          promises.push(query2.find())
          return $q.all(promises)

        },

        payMyBooking: function(booking){
          return this.payTessera(Parse.User.current(),booking,1).then(
            function(ret){
              return Parse.User.current().fetch()
          })
        },

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

        setCallToAction : function(booking){
            booking.set("callToAction",true);
            return booking.save()
        },
        
        createInstallationObject: function(){
            var push = new Ionic.Push({
              "debug": false
            });

            push.register(function(token) {
            console.log("Device token:",token.token);
            Parse.Cloud.run('createInstallationObject', {token:token.token,platform:$rootScope.platform}).then(function(success){
                console.log('okkkkkkk createInstallationObject')
            },function(error){
                console.log(error)
            })
            });
      
        },
        setPreferred: function(user){
                if (!this.isPreferred(user)){
                    Parse.User.current().add('preferences',user)
                    return Parse.User.current().save()    
                }
                Parse.User.current().remove('preferences',user)
                return Parse.User.current().save()
                
            
        },
        isPreferred: function(user){
            var preferences = Parse.User.current().get('preferences')
            var index = _.findIndex(preferences,function(p){
                return p.id == user.id
            })
            return (index != -1)
      
        },
        getPreferred:function(){
            
            var query = new Parse.Query(Parse.User)
            query.equalTo('objectId',Parse.User.current().id)
            query.include('preferences')
            return query.find().then(function (success){
                return success[0].get('preferences')
            })
            
            
        },
        setStatus:function(message){
                console.log(message)
                Parse.User.current().set('status',message)
                return Parse.User.current().save()
                
            
        },
        getPlayersByLevel: function(){
             var query = new Parse.Query(Parse.User)
            query.equalTo('level',Parse.User.current().get('level'))
            query.equalTo('circolo',Parse.User.current().get('circolo'))
            return query.find()
            
        }

    }

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
          var day = {value:moment().add(i, 'days'),label:moment().add(i, 'days').format('dd DD/MM/GG')}
          ret.push(day)
     };
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
