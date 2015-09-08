angular.module('starter.services', [])

.factory('MyObjects', function(Utility,$ionicLoading, $rootScope) {


    return {


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
        },function(error){
          console.log(error);
              $ionicLoading.hide();
        });
      },

      findBookings: function(month,year){
        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) -1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) -1) + "/" + daysInMonth);
        console.log('findBookings called.....' + (parseInt(month) -1)  + "/" + year);
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        var ret = [];
        query.find({
          success: function(results){
            console.log('findBookings successful! JSON Converting...');
            _.each(results, function (obj){
              ret.push(obj.toJSON());
            })
            console.log(ret);
          },
          error: function(error){
            console.log(error);

          }
        })
      },
      getDisponibilitaCoach:function(month,year){

        $ionicLoading.show({
          template: 'Loading...'
        });

        var currentUser = Parse.User.current();
        var maestro = currentUser.get('maestro');

        var daysInMonth = Utility.getDaysInMonth(month,year);
        var startDate = new Date(year + "/" + (parseInt(month) + 1) + "/" + 1);
        var endDate =new Date( year + "/" + (parseInt(month) + 1) + "/" + daysInMonth);
        console.log('getDisponibilitaCoach called.....' + (parseInt(month) +1)  + "/" + year);
        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var query = new Parse.Query(CoachAvalability);
        query.greaterThanOrEqualTo("date", startDate);
        query.lessThanOrEqualTo("date", endDate);
        query.equalTo("maestro",maestro);
        var ret = [];
        return query.find()
        .then(
          function(results){
            console.log('CoachAvalability successful! JSON Converting...');
            _.each(results, function (obj){
              var tmp = obj.toJSON();
              tmp.date = obj.get('date');
              ret.push(tmp);
            })
            $ionicLoading.hide();
            console.log("ret");
            console.log(ret);
            return ret;
          },function(error){
            console.log(error);

          }
        )



      },
      addDisponibilitaCoach:function(obj){
        console.log('addDisponibilitaCoach called.....' );
        var currentUser = Parse.User.current();
        var maestro = currentUser.get('maestro');

        var CoachAvalability = Parse.Object.extend("CoachAvalability");
        var ca = new CoachAvalability();
        ca.set('date',obj.date);
        ca.set('ranges',obj.ranges);
        ca.set('maestro',maestro);
        return ca.save(null);
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
                    //return obj.destroy();

                  }, function(error){
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
.factory('Coaches', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var coaches = [{
    id: 0,
    name: 'Ben Sparrow',
    date: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    date: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    date: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    date: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    date: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return coaches;
    },
    remove: function(coach) {
      coaches.splice(coaches.indexOf(coach), 1);
    },
    get: function(coachId) {
      for (var i = 0; i < coaches.length; i++) {
        if (coaches[i].id === parseInt(coachId)) {
          return coaches[i];
        }
      }
      return null;
    }
  };
})
