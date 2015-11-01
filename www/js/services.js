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
        $ionicLoading.show({
          template: 'Loading...'
        });

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
            $ionicLoading.hide()
            return results
        }, function(error){
          $ionicLoading.hide()
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

        $ionicLoading.show({
          template: 'Loading...'
        });
        var defer = $q.defer()
        var courtsAvalaivable = []
        var courtsNumber = $rootScope.gameTypes[gameT].courtsNumber

        var courts = _.range(1,parseInt(courtsNumber) + 1)
        return this.findBookingsInDate(date,gameT)
        .then(
          function(bookings){
            courts.forEach(function(court){
              console.log("court:" + court);
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
            $ionicLoading.hide()
            return defer.promise;

        }, function(error){

          console.log(error);
          defer.reject(error)
          return defer.promise;
        })
      },
      createBooking:function(obj){


        return this.checkBeforeCreateBooking(obj.date,obj.ranges,obj.gameType)
        .then(
          function(courtsAvalaivable){
            var Booking = Parse.Object.extend("Booking");
            var book = new Booking();
            book.set("user", Parse.User.current());
            book.set("circolo", Parse.User.current().get('circolo'));
            book.set("date", obj.date);
            book.set("ranges", obj.ranges);
            if (obj.court != null){
                book.set("court",obj.court.toString())
            }
            else {
              //Nel caso di prenotazione con maestro
                book.set("court",courtsAvalaivable[0].toString());
            }

            book.set("callToAction",obj.callToAction);

            if (obj.callToAction == true){
                book.add('players',Parse.User.current())

            }
            book.set("gameType",obj.gameType);
            book.set("note",obj.note);
            book.set("payed",false);

            var maestroId = obj.maestro != null ? obj.maestro.id : -1


            console.log(maestroId);
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

      payBooking: function(booking){

        booking.set('payed',true);
        return booking.save();

      },
      findBookingsForSegreteria: function(date){
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



      },
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
        query.equalTo("gameType",gameT);
        var c = Parse.User.current().get('circolo')

        query.equalTo('circolo',c)
        query.include('players')
        query.include('user')

        return query.find()
      },
      findBookingsToPayBeforeDate: function(date){

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.lessThan("date", date);
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
        $ionicLoading.show({
          template: 'Loading...'
        });

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
        if (user.get('maestro') != null){
          query1.equalTo("maestro", user.get('maestro'));
        }
        else query1.equalTo("user", user );
        query1.ascending("date");
        query1.include('players');
        promises.push(query1.find())

        var query2 = new Parse.Query(Booking);
        //Escludo i risultati precedenti....
        query1.notEqualTo("user", user );
        //Cerco le prenotazioni alle quali sono stato invitato o mi sono unito....
        query2.equalTo('players',Parse.User.current())
        query2.greaterThanOrEqualTo("date", today);
        query2.include('players')
        promises.push(query2.find())


        return $q.all(promises).then(
            function(results){
              $ionicLoading.hide()
              return _.flatten(results)

              return

          }, function(error){
            $ionicLoading.hide()
            console.log(error);
          })

      },

      deleteBooking: function(item){
        var Booking = Parse.Object.extend("Booking");
        var b = new Booking();
        b.id = item.id
        console.log(b);
        return b.destroy();


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

        $ionicLoading.show({
          template: 'Loading...'
        });
        var avalaibleRanges = [];
        return this.findBookingsInDate (date,gameT)
        .then(
          function(bookings){

            var myranges = _.range(1, parseInt(config.slotsNumber) + 1);

            _.each(myranges, function(r){
              var px =  _.filter(bookings,function(item){

                  if (item.get('ranges').indexOf(r) != -1 )
                      return item;
              });
              var num = $rootScope.gameTypes[gameT].courtsNumber

              if (px.length < num){

                  avalaibleRanges.push(r);
              }
            })
            $ionicLoading.hide()
            return avalaibleRanges;
        }, function(error){
            $ionicLoading.hide()
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

                  //[{day:d, avalaibleRanges: []}]
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

                //console.log(disponibilitaCoach);
                //console.log(courtsAvalabilities);

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
          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);




          return query.get(cta.id)
          .then(
            function(cta){

              var actualGame = $rootScope.gameTypes[cta.get('gameType')]
              var numPlayers = parseInt(actualGame.numberPlayers)
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
        },
        findCallToAction:function(){
          $ionicLoading.show({
            template: 'Loading...'
          });
          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);
          query.greaterThanOrEqualTo("date", new Date());
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
              $ionicLoading.hide()
              return results
          }, function(error){
            $ionicLoading.hide()
            console.log(error);
          })


        },
        findPlayersWithName:function(name){

          var query = new Parse.Query(Parse.User);
          query.equalTo('circolo',Parse.User.current().get('circolo'))
          query.contains("nome", name.toLowerCase());
          return query.find()

        },

        invite:function(userIdToInvite,bookingIdCalled){
          console.log('invite service');
          var defer = $q.defer()

          Parse.Cloud.run('invite', {user:userIdToInvite,booking: bookingIdCalled})
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

        acceptInvitation: function(invitation){

          var booking = invitation.get('booking')
          booking.add('players',Parse.User.current())
          return booking.save()
          .then(
            function(obj){
              var InvitationRequest = Parse.Object.extend("InvitationRequest");
              var ir = new InvitationRequest();
              ir.id = invitation.id
              ir.destroy()
          }, function(error){
            console.log(error);
          })

        },

        declineInvitation: function(invitation){

          var InvitationRequest = Parse.Object.extend("InvitationRequest");
          var ir = new InvitationRequest();
          ir.id = invitation.id
          return ir.destroy()

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
            console.log('Error retrieving markets');
            deferred.reject(err);
          });
        return deferred.promise;
      }





      return {
        getWeather5Days: getWeatherForecast5Days

      };
    }]);
