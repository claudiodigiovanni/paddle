angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, MyObjects, Utility) {


  Parse.Cloud.run('hello', { }, {
    success: function(result) {
      // ratings should be 4.5
      console.log(result);
    },
    error: function(error) {

    }
  });
  //MyObjects.createBooking();
  MyObjects.findBookings(10,2015);
  console.log(Utility.getHoursFromRanges([1,2,3,4,5,6]));



})

.controller('Login', function($scope, $stateParams, config,MockData,$state, $ionicModal,$ionicBackdrop, $timeout) {

//$scope.currentUser = Parse.User.current();

$ionicModal.fromTemplateUrl('login-modal.html', {
  scope: $scope,
  animation: 'slide-in-up',
  backdropClickToClose:false
}).then(function(modal) {
  $scope.modal = modal;
  $scope.modal.show();
})


$ionicBackdrop.retain();
$timeout(function() {
  $ionicBackdrop.release();
}, 1000);


$scope.closeModal = function() {
  $scope.modal.hide();
};

$scope.$on('$destroy', function() {
  $scope.modal.remove();
});


var currentUser = {}
$scope.currentUser = currentUser;
$scope.registered = true;


$scope.login = function(){

  var username = currentUser.email;
  var pwd = currentUser.password;

  Parse.User.logIn(username, pwd, {
  success: function(user) {
    // Do stuff after successful login.
    $scope.modal.hide();
    console.log("......maestro: " + user.get('maestro'));
    $state.go('tab.dash');
  },
  error: function(user, error) {
    // The login failed. Check error to see why.
    //alert (error);
    console.log(error);

  }
});

}

$scope.logOut = function(form) {
  Parse.User.logOut();
  $scope.currentUser = null;
};

})

.controller('SignUp', function($scope, $stateParams, config,MockData,$state,$ionicModal) {

//$scope.currentUser = Parse.User.current();
var currentUser = {}
$scope.currentUser = currentUser;
$scope.registered = false;

$ionicModal.fromTemplateUrl('signup-modal.html', {
  scope: $scope,
  animation: 'slide-in-up',
  backdropClickToClose: false
}).then(function(modal) {
  $scope.modal = modal;
  $scope.modal.show();
})





$scope.closeModal = function() {
  $scope.modal.hide();
};

$scope.$on('$destroy', function() {
  $scope.modal.remove();
});


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
      $scope.modal.hide();
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


.controller('CoachAvalabilities', function($scope, $stateParams, config,MockData,Coaches,Utility,$ionicModal) {

  console.log("coachId:" + $stateParams.coachId);
  var currentDate = new Date();
  $scope.currentMonth = parseInt(currentDate.getMonth())  ;
  $scope.currentYear = currentDate.getFullYear();

  var prenotazioni = MockData.findBookings (8,2015);
  var disponibilitaCoach = MockData.getDisponibilitaCoach (8,2015);

  var avalaibleRanges = [];
  var selectedRanges = [];

  var booking = {};
  booking.gameType = "P";
  booking.callToAction = false;
  $scope.booking = booking;

  $ionicModal.fromTemplateUrl('ranges-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })


  $scope.openModal = function() {
    selectedRanges = [];
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });


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
    $scope.resolved = null;

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

    $scope.modal.show();

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

    $scope.selectedHours = Utility.getHoursFromRanges(selectedRanges);

  }

  $scope.book = function(booking){


    console.log('booking');
    console.log(selectedRanges);
    var m = parseInt($scope.currentMonth) ;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date($scope.currentYear + "/" + m + "/" + $scope.selectedDay);
    booking.date = date;
    booking.ranges = selectedRanges;
    //TODO
    //new Booking.....
    //Aggiornare Prenotazioni...i range a disposizione sono diminuiti a causa della prenotazione
    console.log('inserim booking....');
    console.log(booking);
    MyObjects.createBooking(booking).then(function(result){

      $scope.resolved = "Prenotazione Effettuata!" ;

    }, function(error){

    })
    selectedRanges = [];

  }


})

.controller('BookCourt', function($scope, $stateParams, config,MockData,Utility, MyObjects, $ionicModal) {

  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  var avalaibleRanges = [];
  var selectedRanges = [];


  var booking = {};
  booking.gameType = "P";
  booking.callToAction = false;
  $scope.booking = booking;

  $ionicModal.fromTemplateUrl('ranges-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })


  $scope.openModal = function() {
    selectedRanges = [];
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });


  var prenotazioni = MyObjects.findBookings (8,2015);
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
    $scope.resolved = null;

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
    console.log('setRangeStatus');
    console.log(selectedRanges);

    $scope.selectedHours = Utility.getHoursFromRanges(selectedRanges);

  }


  $scope.book = function(booking){


    console.log('booking');
    console.log(selectedRanges);
    var m = parseInt($scope.currentMonth) ;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date($scope.currentYear + "/" + m + "/" + $scope.selectedDay);
    booking.date = date;
    booking.ranges = selectedRanges;
    //TODO
    //new Booking.....
    //Aggiornare Prenotazioni...i range a disposizione sono diminuiti a causa della prenotazione
    console.log('inserim booking....');
    console.log(booking);
    MyObjects.createBooking(booking).then(function(result){

      $scope.resolved = "Prenotazione Effettuata!" ;

    }, function(error){

    })
    selectedRanges = [];

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


//{date: new Date(d), ranges:selectedRanges, maestro:maestro1}
.controller('SetAvalability', function($scope, $stateParams, Utility, MyObjects) {

  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  var avalabilities = [];
  $scope.avalabilities = avalabilities;


  $scope.$on('currentMonthChanged', function(event, x) {
      console.log('currentMonthChanged:' + x);
      MyObjects.getDisponibilitaCoach(x,$scope.currentYear).then(
        function(ret){
          avalabilities = ret;
        },
        function(error){
          console.log(error);
        }
      )
  });
  var selectedDays = [];
  var selectedRanges = [];
  $scope.selectedDays = selectedDays;
  $scope.bookedDay = false;

  $scope.getRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    if (selectedRanges.indexOf(pos) != -1){
      return "positive";
    }
      return "light";
  }

  $scope.setRangeStatus = function(pos){
    //alert('getRangeStatus' + pos);
    $scope.mymessage = null;

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
    MyObjects.deleteDisponibilitaCoach(avalabilities[ix])
      .then(
        function(success){
        avalabilities.splice(ix ,1);
      }, function(error){
        console.log(error);
      });
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

    console.log('....click addRange:' );

    if (selectedRanges.length == 0)
      $scope.mymessage = "Occorre selezionare almeno una fascia oraria...."

    var m = parseInt($scope.currentMonth) + 1;
    _.each(selectedDays,function(value, key, list){

      var d = $scope.currentYear + "/" + m + "/" + value;

      MyObjects.addDisponibilitaCoach({date: new Date(d), ranges:selectedRanges}).then(
        function(result){
          avalabilities.push({objectId:result.id, date: new Date(d), ranges:selectedRanges})
          selectedDays = [];
          selectedRanges = [];
          $scope.clickedDay= null;
          $scope.$apply();
      }, function(error){

        selectedDays = [];
        selectedRanges = [];
        $scope.clickedDay= null;
        $scope.$apply();
      })

    })

  }





});
