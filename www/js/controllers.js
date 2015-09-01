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


  $scope.updateFn = function(){
    alert('onSubmit');
  }

  $scope.myrange = {start:9, end:11};

  $scope.ranges = [{start:7,end:9},{start:10,end:12}];

  $scope.newRangesExp = [];



  $scope.$watch('myrange.start', function() {
    var x = $scope.myrange.start;
    $scope.myrange.end = parseInt(x) + 1;
    $scope.newValStart = x % 1 == 0 ? x : x.substring(0,x.indexOf('.')) + '.30';
  })
  $scope.$watch('myrange.end', function() {
    var x = $scope.myrange.end;
    if (parseInt(x) < parseInt($scope.myrange.start))
      $scope.myrange.start = parseInt(x) - 1;
    $scope.newValEnd = x % 1 == 0 ? x : x.substring(0,x.indexOf('.')) + '.30';
  })

  $scope.$watch('ranges',function(){
    //alert('cccs');
    $scope.newRangesExp = [];
    _.each($scope.ranges,function(element, index, list){
      //alert (index);
      $scope.newRangesExp.push (_.range(element.start,element.end + 0.5,0.5))
    })

  })
  var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
  $scope.weeks = Utility.getCalendar(10,2015);

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

  $scope.getStatus = function(day){
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

    _.each(selected, function(value, key, list){
      booked.push(value);

    })
    $scope.selected = [];
    var newRange = {start:$scope.myrange.start,end:$scope.myrange.end};

    $scope.ranges.push(newRange);
    //alert ("BO" + $scope.ranges);
    alert('start:' + $scope.myrange.start + 'end:' + $scope.myrange.end);
    $scope.newRangesExp.push (_.range(parseInt(newRange.start),parseInt(newRange.end) + 0.5,0.5))


  }




});
