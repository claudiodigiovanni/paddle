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

  var currentDate = new Date();
  $scope.currentMonth = currentDate.getMonth();

  $scope.changeMonth = function (pos){

      $scope.currentMonth = parseInt($scope.currentMonth) + parseInt(pos);

  }


  $scope.updateFn = function(){
    alert('onSubmit');
  }

  $scope.getRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    if (pos==1)
      return "positive";
    else if (pos==2)
      return "energized";
  }


  var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
  $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getYear());

  $scope.weekDays = weekDays;
  var booked = [3,4,6,11,21];
  $scope.booked = booked;
  var selected = [];
  $scope.selected = selected;

  $scope.dayClicked = function(day){
    if (day == "-")
      return;
    if (booked.indexOf(day) != -1){
      booked.splice(booked.indexOf(day),1);
    }
    else if (selected.indexOf(day) != -1){
        selected.splice(selected.indexOf(day),1);
      }
    else{
        selected.push(day);
    }
  }

  $scope.getDayStatus = function(day){
    if (booked.indexOf(day) != -1){
      return 'booked';
    }
    else if (selected.indexOf(day) != -1){
      return 'selected';
    }
    else {
      return 'avalaible'
    }
  };

  $scope.addRange = function(range){

  }




});
