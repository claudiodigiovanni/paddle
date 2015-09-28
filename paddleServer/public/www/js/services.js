angular.module('starter.services', [])

.factory('MyObjects', function(Utility,$ionicLoading, $rootScope, config,$q) {

    return {

      getUsersToEnableTest: function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('enabled',false)
        console.log('getUsersToEnable...');
        return query.find()

      },

      getUsersToEnable: function(){
        var query = new Parse.Query(Parse.User);
        query.equalTo('enabled',false)
        console.log('getUsersToEnable...');
        return query.find()
        .then(
          function(results){
          console.log(results);
            return results;
        }, function(error){
          console.log(error);
        })

      },

      getDashboardText : function(){
        var text = []
        var Dashboard = Parse.Object.extend("Dashboard");
        var query = new Parse.Query(Dashboard);
        return query.find()
        .then(
          function(results){
            var item = results[0];
            console.log(results);
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

      findStatistics : function(date){


        var Booking = Parse.Object.extend("Booking");
        var queryT2 = new Parse.Query(Booking);
        queryT2.equalTo("date", date);
        queryT2.equalTo("gameType", "Tx2");
        var ret = {}
        return queryT2.count()

        .then(
          function(obj){
            ret.Tx2 = obj
            var queryT4 = new Parse.Query(Booking);
            queryT4.equalTo("date", date);
            queryT4.equalTo("gameType", "Tx4");
            return queryT4.count()

        }, function(error){
            Utility.handleParseError(error);
        })
        .then(
          function(obj){
            ret.Tx4 = obj
            var queryP = new Parse.Query(Booking);
            queryP.equalTo("date", date);
            queryP.equalTo("gameType", "P");
            return queryP.count()
        }, function(error){
            Utility.handleParseError(error);
        })
        .then(
          function(obj){
            ret.P = obj
            return ret;
        }, function(error){
            Utility.handleParseError(error);
        })

      },

      addCallToActionPlayer: function(cta){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var user = Parse.User.current();
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        return query.get(cta.objectId)
        .then(
          function(cta){
            $ionicLoading.hide();
            var players = cta.get('players')
            var x = _.find(players,{id:user.id})
            if (!x){
              cta.add('players',user);
              return cta.save();
            }


        }, function(error){
          $ionicLoading.hide();
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
        query.include('user')
        query.include('players')
        query.limit(30);
        query.ascending("date");
        var ret = []
        return query.find()
        .then(
          function(results){
              _.each(results, function (obj){
              var stdNumPlayers = obj.get('gameType') == 'Tx2' ? 2 : 4

              if (obj.get('players') && obj.get('players').length >= stdNumPlayers)
                return

              var tmp = obj.toJSON();
              var dx1 = obj.get('date');
              var m = parseInt(dx1.getMonth()) + 1
              tmp.date = dx1.getDate() + "/" + m + "/" + dx1.getFullYear()

              tmp.ranges = Utility.getHoursFromRanges(tmp.ranges)
              tmp.playersName = []
              tmp.user = obj.get('user').get('username')
              tmp.level = obj.get('user').get('level')

              _.each(obj.get('players'), function (p){
                tmp.playersName.push({username:p.get("username"),level:p.get("level")})
              })
              ret.push(tmp);
            })


            $ionicLoading.hide();
            return ret;

        }, function(error){
            Utility.handleParseError(error);
        })

      },
      findCallToActionWithUserAsPlayer:function(){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", new Date());
        query.equalTo("callToAction", true)
        query.equalTo("players", Parse.User.current());
        query.include('user')
        query.include('players')
        query.limit(30);
        query.ascending("date");
        var ret = []
        return query.find()
        .then(
          function(results){
              _.each(results, function (obj){
              var stdNumPlayers = obj.get('gameType') == 'Tx2' ? 2 : 4
              var tmp = obj.toJSON();
              if (obj.get('players') && obj.get('players').length >= stdNumPlayers)
                tmp.complete = true
              else {
                tmp.complete = false
              }
              var dx1 = obj.get('date');
              var m = parseInt(dx1.getMonth()) + 1
              tmp.date = dx1.getDate() + "/" + m + "/" + dx1.getFullYear()

              tmp.ranges = Utility.getHoursFromRanges(tmp.ranges)
              tmp.playersName = []
              tmp.user = obj.get('user').get('username')
              _.each(obj.get('players'), function (p){
                tmp.playersName.push({giocatore:p.get("username"),livello:p.get("level")})
              })
              ret.push(tmp);
            })
            $ionicLoading.hide();
            return ret;
        }, function(error){
            Utility.handleParseError(error);
        })
      },

      checkBeforeCreateBooking: function(date,ranges,gameT){
        var defer = $q.defer()
        var bookedCourt = -1
        var courtsNumber = 0;
        if (gameT == 'Tx2' || gameT == 'Tx4')
          courtsNumber = config.TennisCourtsNumber
        else {
          courtsNumber = config.PaddleCourtsNumber
        }
        var courts = _.range(1,parseInt(courtsNumber) + 1)
        return this.findBookingsInDate(date,gameT)
        .then(
          function(bookings){
            courts.every(function(court){
              console.log("court:" + court);
              var avalaible = true
              ranges.every(function(r){
                var p = _.filter(bookings, function(item){
                  if (item.get("ranges") != null &&
                      item.get("ranges").indexOf(r) != -1 &&
                      item.get("court") != null &&
                      item.get("court") == court){
                    return item
                  }
                })
                console.log(p);
                if ( p != null && p.length > 0){
                  avalaible = false
                }
              })
              if (avalaible == true){
                bookedCourt = court
                //Esco dal ciclo every courts
                return false
              }
              return true;
            })
            if (bookedCourt != "-1"){
              defer.resolve(bookedCourt)
            }
            else {
              defer.reject("Prenotazione non disponibile!")
            }
            return defer.promise;

        }, function(error){
          console.log(error);
          defer.reject(error)
          return defer.promise;
        })
      },
      createBooking:function(obj){
        $ionicLoading.show({
          template: 'Loading...'
        });

        return this.checkBeforeCreateBooking(obj.date,obj.ranges,obj.gameType)
        .then(
          function(bookedCourt){
            var Booking = Parse.Object.extend("Booking");
            var book = new Booking();
            book.set("user", Parse.User.current());
            book.set("date", obj.date);
            book.set("ranges", obj.ranges);
            book.set("court",bookedCourt.toString());
            book.set("callToAction",obj.callToAction);
            book.set("gameType",obj.gameType);
            book.set("note",obj.note);
            book.set("payed",false);

            var Maestro = Parse.Object.extend("Maestro");
            var query = new Parse.Query(Maestro);
            var maestroId = obj.maestro != null ? obj.maestro.objectId : -1

            if (maestroId != -1){
              return query.get(maestroId)
              .then(
                function(maestro){
                    book.set("maestro",maestro)
                    $ionicLoading.hide();

                    return book.save(null)
              }, function(error){
                  console.log(error);
                  Utility.handleParseError(error);
                  $ionicLoading.hide();
              })
            }
            else {
              $ionicLoading.hide();
              return book.save(null)
            }

        }, function(error){
          $ionicLoading.hide();
          console.log(error);
        })
      },

      payBooking: function(booking){

        booking.set('payed',true);
        return booking.save();

      },
      findBookingsForSegreteria: function(date){
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        var ret = {}
        console.log(date);
        this.findBookingsToPayBeforeDate(today)
        .then(
          function(obj){
            console.log(obj);
            ret.bookingsToPayBeforeToday = obj;
            $ionicLoading.hide();
            console.log(ret);

        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })

        this.findBookingsInDate(date,"Tx2")
        .then(
          function(obj){
            console.log(obj);
            ret.resultsTennis = obj;
            $ionicLoading.hide();
            console.log(ret);

        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })
        this.findBookingsInDate(date,"P")
        .then(
          function(obj){
            console.log(obj);
            ret.resultsPaddle = obj;
            $ionicLoading.hide();
            console.log(ret);


        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })

        return ret;

      },
      findBookings: function(month,year){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) +1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) +1) + "/" + daysInMonth);

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        var ret = [];
        return query.find()
          .then(
              function(results){

                _.each(results, function (obj){
                  var tmp = obj.toJSON();
                  tmp.date = new Date(obj.get('date')).getDate();
                  ret.push(tmp);
                })
                $ionicLoading.hide();
                return ret;
                //return ret;
              },
              function(error){
                $ionicLoading.hide();
                Utility.handleParseError(error);

              }
          )
      },
      findBookingsInDate: function(date,gameT){

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.equalTo("date", date);
        if (gameT == "Tx2" || gameT == "Tx4")
          query.containedIn("gameType",['Tx2','Tx4']);
        else
          query.equalTo("gameType","P");

        query.include('user')

        return query.find()
      },
      findBookingsToPayBeforeDate: function(date){

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.lessThan("date", date);
        query.equalTo("payed", false);
        query.include('user')

        return query.find()
      },
      //Se sono un maestro prende le prenotazioni che mi riguardano
      //altrimenti prende le prenotazione dell'utente in sessione
      findMyBookings: function(){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", new Date());
        var user = Parse.User.current()
        if (user.get('maestro') != null){
          query.equalTo("maestro", user.get('maestro'));
        }
        else query.equalTo("user", user );
        query.ascending("date");
        var ret = [];
        return query.find()
          .then(
              function(results){

                _.each(results, function (obj){
                  var tmp = obj.toJSON();
                  var m = parseInt(obj.get('date').getMonth()) + 1
                  tmp.date = obj.get('date').getDate() + "/" + m + "/" +  obj.get('date').getFullYear()
                  tmp.ranges = Utility.getHoursFromRanges(obj.get("ranges"));
                  ret.push(tmp);
                })
                $ionicLoading.hide();
                return ret;
                //return ret;
              },
              function(error){
                $ionicLoading.hide();
                Utility.handleParseError(error);

              }
          )
      },
      deleteBooking: function(item){
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        return query.get(item.objectId)
        .then(
          function(obj){
            return obj.destroy();

        }, function(error){
          console.log(error);
        })

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
                  var px = _.where(bookings,{date:d, ranges:[r],gameType: gameT});
                  var num = 0;
                  if (gameT == 'Tx2' || gameT == 'Tx4')
                    num = config.TennisCourtsNumber
                  else {
                    num = config.PaddleCourtsNumber
                  }
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
      getCoachAvalabilitiesFilteredByBookings:function(month,year,maestroId, typeG){
            var prenotazioni = []
            var avalabilities = []
            var myContext = this;

            return this.findBookings(month,year)
            .then(
                function(prenotazioniRet){
                  prenotazioni = prenotazioniRet
                  //console.log(prenotazioni);

                }, function(error){
                  Utility.handleParseError(error);
                })
            .then(
              function(obj){
                return myContext.getDisponibilitaCoach(month,year,maestroId)
            }, function(error){
                Utility.handleParseError(error);
            })
            .then(
              function(disponibilitaCoach){

                _.each(disponibilitaCoach,function (d){
                  _.each(d.ranges, function(r){
                      var py =  _.filter(prenotazioni,function(item){

                        if (item.date == d.date &&
                            item.ranges.indexOf(r) != -1 && item.maestro != null && item.maestro.objectId == maestroId)
                            return item;
                      });

                      //console.log(py);

                      if (py.length > 0)
                        return

                      var px = _.where(prenotazioni,{date:d.date,ranges:[r], gameType: typeG });
                      //console.log('param');
                      //console.log({date:d.date,ranges:[r], gameType: typeG });
                      var num = 0;
                      if (typeG == 'Tx2' || typeG == 'Tx4')
                        num = config.TennisCourtsNumber
                      else {
                        num = config.PaddleCourtsNumber
                      }

                      if (px.length < num)
                        avalabilities.push({date:d.date,range:r});
                  })
                })

                return avalabilities;

            }, function(error){
                Utility.handleParseError(error);
            })
                //************
      },
      getDisponibilitaCoach:function(month,year,maestroId){

        $ionicLoading.show({
          template: 'Loading...'
        });
        var maestro = null;
        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        return query.get(maestroId)
        .then(
            function(obj){
              maestro = obj

            },
            function (error){
              Utility.handleParseError(error);
            }
          )
        .then(
          function(obj){
            var daysInMonth = Utility.getDaysInMonth(month,year);
            var startDate = new Date(year + "/" + (parseInt(month) + 1) + "/" + 1);
            var endDate =new Date( year + "/" + (parseInt(month) + 1) + "/" + daysInMonth);

            var CoachAvalability = Parse.Object.extend("CoachAvalability");
            var query = new Parse.Query(CoachAvalability);
            query.greaterThanOrEqualTo("date", startDate);
            query.lessThanOrEqualTo("date", endDate);
            query.equalTo("maestro",maestro);
            return query.find()

        }, function(error){
            Utility.handleParseError(error);
        })
        .then(
          function(results){
            var ret = [];

            _.each(results, function (obj){
              var tmp = obj.toJSON();
              tmp.date = new Date(obj.get('date')).getDate();

              ret.push(tmp);
            })
            $ionicLoading.hide();

            return ret;
        }, function(error){
              Utility.handleParseError(error);
        })

      },
      getCoaches: function(){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        return query.find().then(
          function(results){
            $ionicLoading.hide();
            var ret = [];
            _.each(results, function (obj){
              var tmp = obj.toJSON();
              ret.push(tmp);
            })
            return ret;
        }, function (error){
            $ionicLoading.hide();
            Utility.handleParseError(error);
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
      deleteDisponibilitaCoach:function(obj){

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        return query.get(obj.objectId)
              .then(
                  function(myObject) {
                    return myObject;
                  },
                  function(object, error) {
                    Utility.handleParseError(error);
              }
              ).then(
                    function(obj){
                        $ionicLoading.hide();
                        return obj.destroy();
                  }, function(error){
                        $ionicLoading.hide();
                        Utility.handleParseError(error);
                  });
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
        $ionicLoading.hide();
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

.factory('Person', function () {
    return function Person (name) {
      this.name = name;
      console.log('Hello ' + this.name + "!");
      this.changeName = function(){
         this.name = 'Ben2222'
      }
    };
  });
