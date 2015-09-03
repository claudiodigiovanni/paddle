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
.controller('BookCoach', function($scope, $stateParams, config,MockData,Coaches) {

  $scope.coaches = Coaches.all();
})


.controller('CoachAvalabilities', function($scope, $stateParams, config,MockData,Coaches,Utility) {

  var currentDate = new Date();
  $scope.currentMonth = parseInt(currentDate.getMonth())  ;
  $scope.currentYear = currentDate.getFullYear();

  var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
  $scope.weekDays = weekDays;

  $scope.changeMonth = function (pos){

      $scope.currentMonth = parseInt($scope.currentMonth) + parseInt(pos);

  }

  $scope.$watch('currentMonth', function() {
    //alert("month:" + $scope.currentMonth);
    $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());
  })


  var prenotazioni = MockData.getPrenotazioni (8,2015);
  var disponibilitaCoach = MockData.getDisponibilitaCoach (8,2015);

  var avalaibleRanges = [];
  var selectedRanges = [];

  var avalabilities = []
  _.each(disponibilitaCoach,function (d){
    _.each(d.ranges, function(r){
        var px = _.where(prenotazioni,{date:d.date,ranges:[r]});
        if (px && px.length < config.TennisCourtsNumber)
          avalabilities.push({date:d.date,range:r});
    })
  })

  $scope.showAddButton = false;


  $scope.getDayStatus = function(day){

    var e = _.find(avalabilities,function(obj){
        return (obj.date.getDate() == day);
    });


    if (e && $scope.selectedDay == day){
      return "selectedBooked";
    }

    if ( e ){
      return 'booked';
    }

    else {
      return 'free'
    }
  };

  $scope.dayClicked = function(day){

    $scope.showAddButton = false;

    if (day == "-")
      return;
    var ranges = _.pluck(_.filter(avalabilities,function(obj){
        return (obj.date.getDate() == day);
    }),'range');

    if ( ranges.length == 0 ){
      return;
    }
    else{
      $scope.selectedDay =  day;
      avalaibleRanges = ranges;
      selectedRanges = [];
      console.log('dayClicked');
      $scope.showAddButton = true;
    }

  }


  $scope.getRangeStatus = function(pos){

    if (selectedRanges.indexOf(pos) != -1){
      return "energized"
    }

    if (avalaibleRanges.indexOf(pos) != -1){
      return "positive"
    }
    return "light"

  }

  $scope.setRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    if (selectedRanges.indexOf(pos) != -1){
      selectedRanges.splice(selectedRanges.indexOf(pos),1);
      return
    }

    if (avalaibleRanges.indexOf(pos) != -1){
      selectedRanges.push(pos);
    }
    else {

    }

  }

  $scope.book = function(){

    var m = parseInt($scope.currentMonth) + 1;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    //TODO
    //new Booking.....
    //Aggiornare Prenotazioni...i range a disposizione sono diminuiti a causa della prenotazione
    selectedRanges = [];

  }

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
  $scope.currentMonth = parseInt(currentDate.getMonth()) ;
  $scope.currentYear = currentDate.getFullYear();

  var weekDays = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];
  $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());

  $scope.weekDays = weekDays;
  var avalabilities = MockData.getDisponibilitaCoach(8,2015);

  $scope.avalabilities = avalabilities;
  var selectedDays = [];
  var selectedRanges = [];
  $scope.selectedDays = selectedDays;

  $scope.bookedDay = false;


  $scope.changeMonth = function (pos){

      $scope.currentMonth = parseInt($scope.currentMonth) + parseInt(pos);

  }

  $scope.$watch('currentMonth', function() {
    //alert("month:" + $scope.currentMonth);
    $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());
  })


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

  $scope.deleteAvalability = function(){


    var day = $scope.clickedDay;
    var ix = _.findIndex(avalabilities,function(obj){
        return (obj.date.getDate() == day);
    });

      avalabilities.splice(ix ,1);
      selectedRanges = [];
      $scope.showDeleteButton = false;

  }


  $scope.dayClicked = function(day){

    $scope.showDeleteButton = false;

    if (day == "-")
      return;

    $scope.clickedDay = day;

    var e = _.find(avalabilities,function(obj){
        return (obj.date.getDate() == day);
    });
    if ( e ){
      //booked.splice(e,1);
      selectedRanges = e.ranges;
      selectedDays = [];
      $scope.showDeleteButton = true;
    }
    else if (selectedDays.indexOf(day) != -1){
        selectedDays.splice(selectedDays.indexOf(day),1);
        selectedRanges = [];
      }
    else{
        selectedDays.push(day);
        selectedRanges = [];
    }
  }

  $scope.getDayStatus = function(day){

    var e = _.find(avalabilities,function(obj){
        return (obj.date.getDate() == day);
    });

    if ( e && $scope.clickedDay == day){
      return 'selectedBooked';
    }
    else if (e){
      return "booked";
    }
    else if (selectedDays.indexOf(day) != -1){
      return 'selectedDays';
    }
    else {
      return 'free'
    }
  };

  $scope.addRange = function(range){

    var m = parseInt($scope.currentMonth) + 1;
    _.each(selectedDays,function(value, key, list){

      var d = $scope.currentYear + "/" + m + "/" + value;
      avalabilities.push({date: new Date(d), ranges:selectedRanges})


    })
    selectedDays = [];
    selectedRanges = [];
  }




});
