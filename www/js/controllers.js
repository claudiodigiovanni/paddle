angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {

  var TestObject = Parse.Object.extend("TestObject");
  var testObject = new TestObject();
  testObject.save({foo: "barxxx"}).then(function(object) {
    console.log("yay! it worked once again");
  });

})

.controller('Login', function($scope, $stateParams, config,MockData,$state) {

//$scope.currentUser = Parse.User.current();



$scope.currentUser = {};
$scope.registered = true;


$scope.login = function(){
  $state.go('tab.dash');
}

$scope.logOut = function(form) {
  Parse.User.logOut();
  $scope.currentUser = null;
};

})

.controller('SignUp', function($scope, $stateParams, config,MockData,$state) {

//$scope.currentUser = Parse.User.current();
var currentUser = {}
$scope.currentUser = currentUser;
$scope.registered = false;

$scope.signUp = function() {
  console.log('username:' + currentUser.email );
  var user = new Parse.User();
  user.set("email", currentUser.email);
  user.set("username", currentUser.email);
  user.set("password", currentUser.password);

  user.signUp(null, {
    success: function(user) {
      $scope.currentUser = user;
      $scope.$apply(); // Notify AngularJS to sync currentUser
      $state.go('tab.dash');

    },
    error: function(user, error) {
      alert("Unable to sign up:  " + error.code + " " + error.message);
    }
  });
};

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

  var weekDays = ['L','Ma','Me','G','V','S','D']
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
      return "selected";
    }

    if ( e ){
      return 'avalaible';
    }

    else {
      return 'na'
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

.controller('BookCourt', function($scope, $stateParams, config,MockData,Utility, $ionicModal) {

  var currentDate = new Date();
  $scope.currentMonth = parseInt(currentDate.getMonth())  ;
  $scope.currentYear = currentDate.getFullYear();

  var weekDays = ['L','Ma','Me','G','V','S','D']
  $scope.weekDays = weekDays;

  var avalaibleRanges = [];
  var selectedRanges = [];

  $scope.settings = {
    CallToAction: false
  };

  $ionicModal.fromTemplateUrl('ranges-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.openModal = function() {
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });




  $scope.changeMonth = function (pos){

      $scope.currentMonth = parseInt($scope.currentMonth) + parseInt(pos);

  }

  $scope.$watch('currentMonth', function() {
    //alert("month:" + $scope.currentMonth);
    $scope.weeks = Utility.getCalendar($scope.currentMonth,currentDate.getFullYear());
  })


  var prenotazioni = MockData.getPrenotazioni (8,2015);
  var daysInMonth = Utility.getDaysInMonth(8,2015)
  //In una giornata ci sono 48 slot prenotabili....
  var days = _.range(1,parseInt(daysInMonth) +1);
  var ranges = _.range(1, parseInt(config.slotsNumber) + 1);
  var avalabilities = []

  _.each(days,function(d){
      var avalability = {day:d, avalaibleRanges: []};
      var m = parseInt($scope.currentMonth) + 1;
      var dx = $scope.currentYear + "/" + m + "/" + d;
      _.each(ranges, function(r){
        var px = _.where(prenotazioni,{date:new Date(dx), ranges:[r]});
        if (px.length < config.TennisCourtsNumber){
          avalability.avalaibleRanges.push(r);
        }
      })
      avalabilities.push(avalability);
  })
  console.log(avalabilities);

  $scope.showAddButton = false;


  $scope.getDayStatus = function(day){

    var e = _.find(avalabilities,function(obj){
        return (obj.day == day && obj.avalaibleRanges.length >  0);
    });
    if (e && $scope.selectedDay == day){
      return "selected";
    }
    if ( e ){
      return 'avalaible';
    }
    else {
      return 'na'
    }
  };

  $scope.dayClicked = function(day){

    console.log('dayClicked' + day);
    selectedRanges = [];

    $scope.showAddButton = false;

    if (day == "-")
      return;
    var ranges = _.find(avalabilities,function(obj){
        return (obj.day == day);
    }).avalaibleRanges;

    if ( ranges.length == 0 ){
      return;
    }
    else{
      $scope.selectedDay =  day;
      avalaibleRanges = ranges;
      selectedRanges = [];
      console.log(avalaibleRanges);
      $scope.showAddButton = true;
      $scope.modal.show()
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

    $scope.modal.hide();

  }
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})


.controller('callToAction', function($scope, MockData) {

  var currentDate = new Date();
  var cta = MockData.getCallToActionOpenFrom (currentDate);

  $scope.callToActionOpen = cta


})



.controller('SetAvalability', function($scope, $stateParams, Utility, MockData) {

  var currentDate = new Date();
  $scope.currentMonth = parseInt(currentDate.getMonth()) ;
  $scope.currentYear = currentDate.getFullYear();

  var weekDays = ['L','Ma','Me','G','V','S','D']
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
      return 'selected';
    }
    else if (e){
      return "avalaible";
    }
    else if (selectedDays.indexOf(day) != -1){
      return 'multiple-select';
    }
    else {
      return 'na'
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
