angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {

  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "bar"}).then(function(object) {
    console.log("yay! it worked");
  });

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('SetAvalability', function($scope, $stateParams, Utility) {

  var days = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];

  var firstDateOfMonth = Utility.getDayOfFirstDateOfMonth(2,2015);
  var pos = days.indexOf(firstDateOfMonth);

  var datex = new Date();
  //var daysInMonth = Utility.getDaysInMonth(datex.getMonth(),datex.getYear());

  var daysInMonth = Utility.getDaysInMonth(2,2015);



  console.log('daysInMonth:' + daysInMonth);

  var myDay = 1;

  var weeks = [];

  for (var r = 1; r<=6; r++){

    var week = [];

    if (r == 1){
      for (var i = 0; i < pos; i++){
        week.push('-');
      }
      for (var j = pos ; j < 7 ;j++){
        week.push(myDay);
        myDay++;
      }
    }
    if ( r != 1 && myDay <= daysInMonth){
      for (var w = 0 ; w < 7 ;w++){
        if (myDay <= daysInMonth)
          week.push(myDay);
        else {
          week.push('-');
        }
        myDay++;
      }
    }
    weeks.push (week);

  }

  console.log(weeks);







  $scope.days = days;
  var booked = [];
  var selected = [];

  var date = new Date() ;
  var currentDate = date.getDate();

  console.log('ccc'+ currentDate);
  //date.setDate(date.getDate() + 8);
  //console.log (days[(date.getDay() + 6 ) % 7]);

  var getDayStatus = function(day){

    if (day < currentDate){
      return 'Disabled';
    }


  };




});
