angular.module('starter.services', [])

.factory('Utility',function(){

  return {
    /*
    The month passed in is 1 for January, 2 for February and so on through to 12 for December.

The way the above code works is that the month passed to the Date constructor is actually 0 based (i.e. 0 is January, 1 is February etc) so it is in effect creating a date for the day 0 of the next month. Because day 0 equates to the last day of the previous month the number returned is effectively the number of days for the month we want.
    */
    getDaysInMonth: function(month,year) {
      return new Date(year, month, 0).getDate();
    },
    getDayOfFirstDateOfMonth: function(month,year){

      var days = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
      var date = new Date (year, month-1, 1);
      return days[(date.getDay() + 6 ) % 7];
      //return date.getDay();
    },
    getCalendar: function(month,year){

      var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
      var firstDateOfMonth = this.getDayOfFirstDateOfMonth(month,year);
      var pos = weekDays.indexOf(firstDateOfMonth);
      var daysInMonth = this.getDaysInMonth(month,year);
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

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
