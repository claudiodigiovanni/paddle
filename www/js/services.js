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

      },

      getUsersToEnable: function(){
        var c = Parse.User.current().get('circolo');
        var query = new Parse.Query(Parse.User);
        query.equalTo('enabled',false)
        query.equalTo('circolo',c)
        console.log('getUsersToEnable...');
        return query.find()


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


        var defer = $q.defer()
        var courtsAvalaivable = []
        var courtsNumber = 0;
        if (gameT == 'Tx2')
          courtsNumber = config.ClayTennisCourtsNumber
        else if (gameT == 'Tx4'){
          courtsNumber = config.HardTennisCourtsNumber
        }
        else{
          courtsNumber = config.PaddleCourtsNumber
        }
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
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        var ret = {}

        this.findBookingsToPayBeforeDate(today)
        .then(
          function(obj){
            console.log(obj);
            ret.bookingsToPayBeforeToday = obj;
            $ionicLoading.hide();

        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })

        this.findBookingsInDate(date,"Tx2")
        .then(
          function(obj){
            ret.resultsTennisClay = obj;
            $ionicLoading.hide();
        }, function(error){
          console.log(error);
          $ionicLoading.hide();
        })

        this.findBookingsInDate(date,"Tx4")
        .then(
          function(obj){
            ret.resultsTennisHard = obj;
            $ionicLoading.hide();
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
        var mycontext = this
        var ret = []
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);

        query.greaterThanOrEqualTo("date", today);

        query.equalTo("callToAction", false)

        var user = Parse.User.current()
        if (user.get('maestro') != null){
          query.equalTo("maestro", user.get('maestro'));
        }
        else query.equalTo("user", user );
        query.ascending("date");

        return query.find()
        .then(
          function(results){

            ret = ret.concat(results)
            return mycontext.findCallToActionWithUserAsPlayer()
        }, function(error){
          console.log(error);
        })
        .then(
          function(results){

            ret = ret.concat(results)

            return ret
        }, function(error){
          console.log(error);
        })



      },
      findCallToActionWithUserAsPlayer:function(){

        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);

        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);

        query.greaterThanOrEqualTo("date", today);

        query.equalTo("callToAction", true)
        query.equalTo("players", Parse.User.current());
        query.include('user')
        query.include('players')
        query.limit(30);
        query.ascending("date");

        return query.find()

      },

      deleteBooking: function(item){
        var Booking = Parse.Object.extend("Booking");
        var b = new Booking();
        b.id = item.id
        console.log(b);
        return b.destroy();

        /*var query = new Parse.Query(Booking);
        return query.get(item.objectId)
        .then(
          function(obj){
            return obj.destroy();

        }, function(error){
          console.log(error);
        })*/

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

                  var num = 0;
                  if (gameT == 'Tx2')
                    num = config.ClayTennisCourtsNumber
                  else if (gameT == 'Tx4'){
                    num = config.HardTennisCourtsNumber
                  }
                  else{
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
      findaAvalaibleRangesInDate: function(date,gameT){
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
              var num = 0;
              if (gameT == 'Tx2')
                num = config.ClayTennisCourtsNumber
              else if (gameT == 'Tx4'){
                num = config.HardTennisCourtsNumber
              }
              else{
                num = config.PaddleCourtsNumber
              }
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


            console.log('maestroId:' + maestroId);
            return this.findAvalabilities(month,year,typeG)
            .then(
                function(results){

                  //[{day:d, avalaibleRanges: []}]
                  courtsAvalabilities = results
                  console.log(results);


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
                console.log(avalabilities);
                return avalabilities;

            }, function(error){
                console.log(error);
                Utility.handleParseError(error);
            })
                //************
      },
      getDisponibilitaCoach:function(month,year,maestroId){

        var maestro = null;
        var Maestro = Parse.Object.extend("Maestro");

        console.log(maestroId);
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
      deleteDisponibilitaCoach:function(obj){

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var c = new CoachAvalability();
        c.id = obj.objectId
        c.destroy()

      },  findStatistics : function(date){


          var Booking = Parse.Object.extend("Booking");
          var queryT2 = new Parse.Query(Booking);
          queryT2.equalTo("date", date);
          queryT2.equalTo("gameType", "Tx2");
          var c = Parse.User.current().get('circolo');
          queryT2.equalTo("circolo", c);

          var ret = {}
          return queryT2.count()

          .then(
            function(obj){
              ret.Tx2 = obj
              var queryT4 = new Parse.Query(Booking);
              queryT4.equalTo("date", date);
              queryT4.equalTo("gameType", "Tx4");
              queryT4.equalTo("circolo", c);
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
              queryP.equalTo("circolo", c);
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

          var defer = $q.defer()
          var user = Parse.User.current();
          var Booking = Parse.Object.extend("Booking");
          var query = new Parse.Query(Booking);

          return query.get(cta.id)
          .then(
            function(cta){

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
              }else{
                defer.reject('Utente già inserito')
              }

              return defer.promise
          }, function(error){

            Utility.handleParseError(error);

          })
        },
        findCallToAction:function(){

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

.factory('Person', function () {
    return function Person (name) {
      this.name = name;
      console.log('Hello ' + this.name + "!");
      this.changeName = function(){
         this.name = 'Ben2222'
      }
    };
  });
