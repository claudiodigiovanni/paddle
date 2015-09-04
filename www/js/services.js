angular.module('starter.services', [])


.factory('MockData',function(){

  return {
    getPrenotazioni :function(month,year){
      var user1 = "user1";
      var prenotazioni = [{user:user1, date:new Date("2015/09/2"),ranges:[1,2,3,4],campo:1,maestro:1},{user:user1, date:new Date("2015/09/2"),ranges:[3,4,5],campo:1,maestro:1}];
      return prenotazioni;

    },
    getDisponibilitaCoach:function(month,year){
      var disponibilitaCoach = [{date:new Date("2015/09/2"),ranges:[1,2,3,4,6],maestro:1},{date:new Date("2015/09/9"),ranges:[1,2,3,4,8],maestro:1}];
      return disponibilitaCoach;
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
      var days = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
      var date = new Date (year, month, 1);
      //alert('date.getDay()'+ date.getDay());
      return days[(date.getDay() + 6 ) % 7];
      //return date.getDay();
    },
    getCalendar: function(month,year){

    //  alert('month:' +  month)
      //alert('year:' +  year)

      var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
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
    }


  };
})
