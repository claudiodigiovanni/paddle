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
          console.log(error);
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
              console.log(tmp.ranges);
              tmp.ranges = Utility.getHoursFromRanges(tmp.ranges)
              tmp.playersName = []
              tmp.user = obj.get('user').get('username')

              _.each(obj.get('players'), function (p){
                tmp.playersName.push(p.get("username"))
              })
              ret.push(tmp);
            })

            console.log(ret);
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
        return book.save(null).then(function(object) {
              console.log("yay! Booking Confirmed");
              $ionicLoading.hide();
              return object;
        },function(error){
          console.log(error);
              $ionicLoading.hide();
        });
      },

      findBookings: function(month,year){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) +1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) +1) + "/" + daysInMonth);
        console.log('findBookings called.....' + (parseInt(month) +1)  + "/" + year);
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        var ret = [];
        return query.find()
          .then(
              function(results){
                console.log('findBookings successful! JSON Converting...');
                _.each(results, function (obj){
                  var tmp = obj.toJSON();
                  tmp.date = new Date(obj.get('date')).getDate();
                  ret.push(tmp);

                })
                $ionicLoading.hide();

                console.log(ret);
                return ret;
                //return ret;
              },
              function(error){
                $ionicLoading.hide();
                console.log(error);

              }
          )
      },
      findMyBookings: function(){
        $ionicLoading.show({
          template: 'Loading...'
        });
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", new Date());
        query.equalTo("user", Parse.User.current());
        query.ascending("date");
        var ret = [];
        return query.find()
          .then(
              function(results){
                console.log('findBookings successful! JSON Converting...');
                _.each(results, function (obj){
                  var tmp = obj.toJSON();
                  tmp.date = obj.get('date').getDate() + "/" + obj.get('date').getMonth() + "/" +  obj.get('date').getFullYear()

                  tmp.ranges = Utility.getHoursFromRanges(obj.get("ranges"));
                  ret.push(tmp);

                })
                $ionicLoading.hide();

                console.log(ret);
                return ret;
                //return ret;
              },
              function(error){
                $ionicLoading.hide();
                console.log(error);

              }
          )
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
                //var m = parseInt($scope.currentMonth) + 1;
                //var dx = $scope.currentYear + "/" + m + "/" + d;
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
            console.log(avalabilities);
            return avalabilities;

        }, function(error){
          console.log(error);
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
                console.log('dispocoach');
                console.log(disponibilitaCoach);
                console.log(prenotazioni);
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
                      console.log('px length....');
                      console.log(px.length);
                      console.log(config.PaddleCourtsNumber);
                      if (px.length < num)
                        avalabilities.push({date:d.date,range:r});
                  })
                })
                console.log('zzzzz1');
                console.log(avalabilities);
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
              console.log('risolto maestro....');
              console.log(maestro);
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
            console.log('getDisponibilitaCoach called.....' + (parseInt(month) +1)  + "/" + year);
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
            console.log('CoachAvalability successful! JSON Converting...');
            _.each(results, function (obj){
              var tmp = obj.toJSON();
              tmp.date = new Date(obj.get('date')).getDate();

              ret.push(tmp);
            })
            $ionicLoading.hide();
            console.log("ret");
            console.log(ret);
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
        console.log('addDisponibilitaCoach called.....' );
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
        //var deferred = $q.defer();
        console.log('deleteDisponibilitaCoach called inside service.....' );
        console.log(obj);
        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        return query.get(obj.objectId)
              .then(
                  function(myObject) {

                    console.log('get ok...');
                    console.log(myObject);
                    return myObject;
                  },
                  function(object, error) {

                    console.log(error);
              }
              ).then(
                    function(obj){
                    console.log('delete ...');
                    console.log(obj);
                    console.log(obj.destroy());
                    $ionicLoading.hide();
                    //return obj.destroy();

                  }, function(error){
                    $ionicLoading.hide();
                    console.log(error);
                  });
      }

    };
  })


.factory('MockData',function(){

  return {
    findBookings :function(month,year){
      var user1 = "user1";
      var prenotazioni = [{user:user1, date:new Date("2015/09/2"),ranges:[1,2,3,4],campo:1,maestro:1, callToAction:1},{user:user1, date:new Date("2015/09/2"),ranges:[3,4,5],campo:1,maestro:1, callToAction:1}];
      return prenotazioni;

    },
    getDisponibilitaCoach:function(month,year){
      var disponibilitaCoach = [{date:new Date("2015/09/2"),ranges:[1,2,3,4,6],maestro:1},{date:new Date("2015/09/9"),ranges:[1,2,3,4,8],maestro:1}];
      return disponibilitaCoach;
    },

    getCallToActionOpenFrom: function(date){
      var user1 = "user1";
      var user2 = "user2";
      var user3 = "user3";
      var cta = [{user:user1, date:new Date("2015/09/2"),ranges:[1,2,3,4],campo:1,maestro:1, callToAction:1,players:[user2,user3]},{user:user2, date:new Date("2015/09/2"),ranges:[3,4,5],campo:1,maestro:1, callToAction:1, players:[user1,user3]}];
      return cta;
    }
  }

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

    //  alert('month:' +  month)
      //alert('year:' +  year)

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
    test: function() {
      console.log('test');
    },

    getHoursFromRanges: function(ranges){

      var ret = "";
      _.each(ranges,function(r){
        var end = (parseInt(r) % 2) == 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        r  = r - 0.5
        var start = (parseInt(r) % 2) == 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        ret += "  " + start + "-" + end;
      })
      return ret;
    }


  };
})
