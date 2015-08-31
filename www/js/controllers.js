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

  var firstDateOfMonth = Utility.getDayOfFirstDateOfMonth(3,2015);
  var pos = days.indexOf(firstDateOfMonth);

  var datex = new Date();
  //var daysInMonth = Utility.getDaysInMonth(datex.getMonth(),datex.getYear());

  var daysInMonth = Utility.getDaysInMonth(3,2015);

  

  console.log('daysInMonth:' + daysInMonth);

  var myDay = 1;


  var week1 = [];
  for (var i = 0; i < pos; i++){
    week1.push('-');
  }
  for (var j = pos ; j < 7 ;j++){
    week1.push(myDay);
    myDay++;
  }
  var week2 = [];
  for (var t = 0 ; t < 7 ;t++){
    week2.push(myDay);
    myDay++;
  }
  var week3 = [];
  for (var y = 0 ; y < 7 ;y++){
    week3.push(myDay);
    myDay++;
  }
  var week4 = [];
  for (var x = 0 ; x < 7 ;x++){
    week4.push(myDay);
    myDay++;
  }

console.log('prima di week5:' + myDay);
  var week5 = [];
  if (myDay <= daysInMonth){
    for (var z = 0 ; z < 7 ;z++){
      if (myDay <= daysInMonth)
        week5.push(myDay);
      else {
        week5.push('-');
      }
      myDay++;
    }
  }
console.log('prima di week6:' + myDay);
  var week6 = [];
  if (myDay <= daysInMonth){
    for (var w = 0 ; w < 7 ;w++){
      if (myDay <= daysInMonth)
        week6.push(myDay);
      else {
        week6.push('-');
      }
      myDay++;
    }
  }



  console.log(week1);
  console.log(week2);
  console.log(week3);
  console.log(week4);
  console.log(week5);
  console.log(week6);






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
