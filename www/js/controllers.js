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

/*
{user1,data,[1,2,3,6,8], campo1, maestro1}
1) Seleziona dispo maestro
2) Seleziona Prenotazoni

*/
.controller('BookCoach', function($scope, $stateParams, config,MockData) {

  var prenotazioni = MockData.getPrenotazioni (8,2015);
  var disponibilitaCoach = MockData.getDisponibilitaCoach (8,2015);

  var avalabilities = []
  _.each(disponibilitaCoach,function (d){
    _.each(d.ranges, function(r){
        var px = _.where(prenotazioni,{date:d.date,ranges:[r]});
        if (px && px.length < config.TennisCourtsNumber)
          avalabilities.push({date:d.date,range:r});
    })
  })
  console.log(avalabilities);
})


.controller('BookCourt', function($scope, $stateParams, config,MockData,Utility) {

  var prenotazioni = MockData.getPrenotazioni (8,2015);
  var daysInMonth = Utility.getDaysInMonth(8,2015)
  //In una giornata ci sono 48 slot prenotabili....
  var days = _.range(1,parseInt(daysInMonth));
  var avalabilities = []

  _.each(days,function(day){
      var px = _.where(prenotazioni,{date:new Date('2015/08/' + day)});
      if (px && px.length < config.TennisCourtsNumber)
        avalabilities.push({date:new Date('2015/08/' + day)});
  })
  console.log(avalabilities);
})



.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('SetAvalability', function($scope, $stateParams, Utility, MockData) {

  var currentDate = new Date();
  $scope.currentMonth = parseInt(currentDate.getMonth());
  $scope.currentYear = currentDate.getFullYear();

  $scope.changeMonth = function (pos){

      $scope.currentMonth = parseInt($scope.currentMonth) + parseInt(pos);

  }

  $scope.$watch('currentMonth', function() {
    //alert("month:" + $scope.currentMonth);
    $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());
  })


  $scope.updateFn = function(){
    alert('onSubmit');
  }

  $scope.getRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    if (selectedRanges.indexOf(pos) != -1){
      return "positive";
    }
      return "light";
  }

  $scope.setRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    if (selectedRanges.indexOf(pos) != -1){
      selectedRanges.splice(selectedRanges.indexOf(pos),1);
    }
    else {
      selectedRanges.push(pos);
    }

  }

  var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
  $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());

  $scope.weekDays = weekDays;
  var booked = MockData.getBookings(8,2015);

  $scope.booked = booked;
  var selectedDays = [];
  var selectedRanges = [];
  $scope.selectedDays = selectedDays;

  $scope.bookedDay = false;

  $scope.deleteBooking = function(day){
      booked.splice(booked.indexOf($scope.selectedBookedDay) ,1);
      $scope.bookedDay = false;
      selectedRanges = [];

  }

  $scope.dayClicked = function(day){
    if (day == "-")
      return;
    var e = _.find(booked,function(obj){
        return (obj.date.getDate() == day);
    });
    if ( e ){
      //booked.splice(e,1);
      selectedRanges = e.ranges;
      $scope.selectedBookedDay = e;
      $scope.bookedDay = true;
      selectedDays = [];


    }
    else if (selectedDays.indexOf(day) != -1){
        selectedDays.splice(selectedDays.indexOf(day),1);
        $scope.bookedDay = false;
      }
    else{
        selectedDays.push(day);
        $scope.bookedDay = false;
    }
  }

  $scope.getDayStatus = function(day){


    if ($scope.bookedDay){
      var mydate = new Date($scope.selectedBookedDay.date);
      if (day == mydate.getDate()){
        return "bookedSelected";
      }

    }

    var e = _.find(booked,function(obj){
        return (obj.date.getDate() == day);
    });
    if ( e ){
      return 'booked';
    }
    else if (selectedDays.indexOf(day) != -1){
      return 'selectedDays';
    }
    else {
      return 'avalaible'
    }
  };

  $scope.addRange = function(range){

    _.each(selectedDays,function(value, key, list){

      var d = $scope.currentYear + "/" + $scope.currentMonth + "/" + value;
      booked.push({date: new Date(d), ranges:selectedRanges})


    })

    selectedDays = [];
    selectedRanges = [];

  }




});
