angular.module('starter.services', [])

.factory('MyObjects', function(Utility,$ionicLoading, $rootScope, config) {

    return {

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
            cta.add('players',user);
            return cta.save();

        }, function(error){
          $ionicLoading.hide();

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
              var tmp = obj.toJSON();
              var dx1 = obj.get('date');
              tmp.date = dx1.getDate() + "/" + dx1.getMonth() + "/" + dx1.getFullYear()

              tmp.ranges = Utility.getHoursFromRanges(tmp.ranges)
              tmp.playersName = []
              tmp.user = obj.get('user').get('username')

              _.each(obj.get('players'), function (p){
                tmp.playersName.push(p.get("username"))
              })
              ret.push(tmp);
            })


            $ionicLoading.hide();
            return ret;

        }, function(error){
          console.log(error);
        })

      },
      createBooking:function(obj){
        $ionicLoading.show({
          template: 'Loading...'
        });

        var Booking = Parse.Object.extend("Booking");
        var book = new Booking();
        book.set("user", Parse.User.current());
        book.set("date", obj.date);
        book.set("ranges", obj.ranges);
        book.set("court",obj.court);
        book.set("callToAction",obj.callToAction);
        book.set("gameType",obj.gameType);
        var Maestro = Parse.Object.extend("Maestro");
        var query = new Parse.Query(Maestro);
        var maestroId = obj.maestro !== null ? obj.maestro.objectId : -1

        if (maestroId != -1){
          return query.get(maestroId)
          .then(
            function(maestro){
                book.set("maestro",maestro)
                $ionicLoading.hide();
                return book.save(null)
          }, function(error){
                console.log(error);
                $ionicLoading.hide();
          })
        }
        else {
          $ionicLoading.hide();
          return book.save(null)
        }


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
                console.log(error);

              }
          )
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
        if (user.get('maestro') !== null){
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
                  tmp.date = obj.get('date').getDate() + "/" + obj.get('date').getMonth() + "/" +  obj.get('date').getFullYear()
                  tmp.ranges = Utility.getHoursFromRanges(obj.get("ranges"));
                  ret.push(tmp);
                })
                $ionicLoading.hide();
                return ret;
                //return ret;
              },
              function(error){
                $ionicLoading.hide();
                console.log(error);

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

                }, function(error){
                  console.log(error);
                })
            .then(
              function(obj){
                return myContext.getDisponibilitaCoach(month,year,maestroId)
            }, function(error){
              console.log(error);
            })
            .then(
              function(disponibilitaCoach){

                _.each(disponibilitaCoach,function (d){
                  _.each(d.ranges, function(r){
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
              console.log(error);
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
              console.log(error);
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
          console.log(error);
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
          console.log(error);
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
            console.log(error);
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
            console.log(error);
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
                    console.log(error);
              }
              ).then(
                    function(obj){
                        $ionicLoading.hide();
                        return obj.destroy();
                  }, function(error){
                        $ionicLoading.hide();
                        console.log(error);
                  });
      }

    };
  })

.factory('Utility',function(){

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
    }
  };
})
