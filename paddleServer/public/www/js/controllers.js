angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, MyObjects, Utility,$ionicModal, $rootScope,$ionicDeploy) {





  // Update app code with new release from Ionic Deploy
  doUpdate = function() {
    $ionicDeploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    return $ionicDeploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $scope.hasUpdate = hasUpdate;
      return hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
  }

  checkForUpdates()
  .then(
    function(hasUpdate){
      if (hasUpdate)
        doUpdate()

  }, function(error){
    console.log(error);
  })


  /*Parse.Cloud.run('hello', { }, {
    success: function(result) {
      // ratings should be 4.5
      console.log(result);
    },
    error: function(error) {

    }
  });*/

  var edit = {text:"xxxx"}

  $scope.edit = edit


  $ionicModal.fromTemplateUrl('edit.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })
  .then(
    function(obj){

      return MyObjects.getDashboardText()

  }, function(error){
    console.log(error);
  })
  .then(
    function(text){

        $scope.text = text

  }, function(error){
    console.log(error);
  })


  $scope.closeModal = function() {
    $scope.modal.hide();
    MyObjects.saveDashboardText($scope.index,edit.text)
    $scope.text[$scope.index] = edit.text
    //$state.go('tab.account');
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.openModal = function(index) {

    edit.text = $scope.text[index]
    $scope.index = index
    $scope.modal.show();
    //$state.go('tab.account');
  };

})

.controller('Login', function($scope, $stateParams, config,$state, $ionicModal,$ionicBackdrop, $timeout, $rootScope,$ionicLoading) {

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

$ionicModal.fromTemplateUrl('reset-pwd.html', {
  scope: $scope,
  animation: 'slide-in-up',
  backdropClickToClose:false
}).then(function(modal) {
  $scope.resetPwdModal = modal;

})


var currentUser = {}
$scope.currentUser = currentUser;
$scope.registered = true;
var mymessage = {text:""}
$scope.mymessage = mymessage;


$scope.login = function(){

  $ionicLoading.show({
    template: 'Loading...'
  });

  var missing = currentUser.username == null || currentUser.password == null

  if (missing){
    mymessage.text = "Email o password errata...."
    return
  }


  var uname = currentUser.username.toLowerCase();
  var pwd = currentUser.password;

  Parse.Cloud.run('login', {username:uname, password:pwd }, {
    success: function(sessionToken) {
        Parse.User.become(sessionToken).then(function (user) {
          // The current user is now set to user.
          $scope.modal.hide();
          $ionicLoading.hide();
          $state.go('tab.dash');
        }, function (error) {
          // The token could not be validated.
        });
    },
    error: function(error) {
      $ionicLoading.hide();
      mymessage.text = error.message
      console.log(error);
      $scope.$apply();

    }
  })

}

$scope.resetPwd = function(){
  $scope.modal.hide();
  $scope.resetPwdModal.show();
}

$scope.confirmResetPwd = function(){
  console.log($scope.resetPwd.email);
  var email = $scope.resetPwd.email
  Parse.User.requestPasswordReset(email, {
      success: function() {
      // Password reset request was sent successfully
      Parse.User.logOut();
      },
      error: function(error) {
        // Show the error message somewhere
        alert("Error: " + error.code + " " + error.message);
      }
    });

  $scope.resetPwdModal.hide();
  $scope.modal.show();
}

$scope.gotoSignUp = function(){
  $scope.modal.hide();
  $state.go('signUp');
}

$scope.logOut = function(form) {
  Parse.User.logOut();
  $scope.currentUser = null;
};

})

.controller('SignUp', function($scope, $stateParams, config,$state,$ionicModal, $ionicLoading, $rootScope,$http,vcRecaptchaService) {

//$scope.currentUser = Parse.User.current();
var currentUser = {level:3}
$scope.currentUser = currentUser;
$scope.registered = false;

var mymessage = {text:""}
$scope.mymessage = mymessage;



$scope.login = function() {
  //$scope.modal.hide();
  $state.go('login');
  //$rootScope.$broadcast('openLoginModal', 'x' );
};





$scope.setResponse= function(response){
  $scope.captchaResponse = vcRecaptchaService.getResponse();
  //console.log(response);

}





$scope.signUp = function() {
  $ionicLoading.show({
    template: 'Loading...'
  });



if ($rootScope.platform != 'ios' && $rootScope.platform != 'android' && $scope.captchaResponse == null){
  mymessage.text = "Occorre verificare correttamente il captcha..."
  $ionicLoading.hide();
  return
}

  if ( currentUser.email === null || currentUser.email === undefined || currentUser.password === null || currentUser.username === null){
    console.log(currentUser.email);
    mymessage.text = "Occorre inserire email, username e password..."
    $ionicLoading.hide();
    return
  }
  console.log('username:' + currentUser.email );

  var e = currentUser.email.toLowerCase()
  var u = currentUser.username.toLowerCase()
  var n = currentUser.nome
  var p = currentUser.password
  var l = currentUser.level

  Parse.Cloud.run('signUp', {email:e, username:u, password:p,level:l ,nome:n, captchaResponse: $scope.captchaResponse, platform: $rootScope.platform}, {
    success: function(user) {
      //$scope.modal.hide();
      $ionicLoading.hide();
      //Parse.User.logOut();
      $state.go('waitingToBeEnabled');
    },
    error: function(error) {
      $ionicLoading.hide();
      mymessage.text = "Non è possibile registrarsi. (Error :  " + error + ")";
      console.log(error);
    }
  })


};

})

/*
{user1,data,[1,2,3,6,8], campo1, maestro1}
1) Seleziona dispo maestro
2) Seleziona Prenotazoni

*/
.controller('BookCoach', function($scope, $stateParams, config,MyObjects) {

  MyObjects.getCoaches().then(function(results){
    $scope.coaches = results
  },function(error){
    console.log(error);
  })

})


.controller('CoachAvalabilities', function($scope, $stateParams, config,MyObjects,Utility,$ionicModal, $state, $rootScope) {

  $ionicModal.fromTemplateUrl('ok-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modalok = modal;
  })

  $scope.closeModalok = function() {
    $scope.modalok.hide();
    $state.go('tab.account');
  };

  $scope.$on('$destroy', function() {
    $scope.modalok.remove();
  });


  console.log("coachId:" + $stateParams.coachId);
  MyObjects.getCoach($stateParams.coachId)
  .then(
    function(maestro){
        $scope.nomeMaestro = maestro.nome;

        $scope.maestro = maestro;
        console.log($scope.maestro);
  }, function(error){
        console.log(error);
  })


  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())
  $scope.currentMonth =  currentMonth
  $scope.currentYear = currentDate.getFullYear();

  var avalabilities = []
  var avalaibleRanges = [];
  var selectedRanges = [];

  $scope.showAddButton = false;

  var booking = {};
  booking.gameType = "P";
  booking.callToAction = false;

  $scope.booking = booking;
  $scope.$on('currentDateChanged', function(event, x) {

      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      MyObjects.getCoachAvalabilitiesFilteredByBookings(m,y, $stateParams.coachId, booking.gameType )
      .then(
        function(results){
          avalabilities = results
      }, function(error){
        console.log(error);
      })
  });

  $scope.$watch('booking.gameType',function(obj){
    MyObjects.getCoachAvalabilitiesFilteredByBookings($scope.currentMonth,$scope.currentYear, $stateParams.coachId, booking.gameType )
    .then(
      function(results){
        avalabilities = results


    }, function(error){
      console.log(error);
    })


  })

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

  $scope.getDayStatus = function(day){

    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    var m = parseInt($scope.currentMonth) + 1
    var selectedDate = new Date( $scope.currentYear + "/" + m + "/" + day);

    if (selectedDate < today )
      return "disabled";

    var e = _.find(avalabilities,function(obj){
        return (obj.date == day);
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
        return (obj.date == day);
    }),'range');

    if ( ranges.length === 0 ){
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

    if ($scope.selectedDay === null || selectedRanges === null || selectedRanges.length === 0) {
      $scope.resolved = "Selezionare giorno e fascia oraria."
      return;
    }


    if ($rootScope.userRole == 'segreteria' && booking.note === undefined){
      $scope.resolved = "Inserire il nome del giocatore."
      return;
    }

    var m = parseInt($scope.currentMonth) + 1;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date($scope.currentYear + "/" + m + "/" + $scope.selectedDay);
    booking.date = date;
    booking.ranges = selectedRanges;
    booking.maestro = $scope.maestro

    MyObjects.createBooking(booking).then(function(result){

      $scope.resolved = "Prenotazione Effettuata!" ;
      $scope.modalok.show();

    }, function(error){
        console.log(error);
    })
    selectedRanges = [];
  }
})

.controller('BookCourt', function($scope, $stateParams, config,Utility, MyObjects, $ionicModal, $state,$rootScope) {

  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  var avalaibleRanges = [];
  var selectedRanges = [];

  var avalabilities = []


  var booking = {};
  booking.gameType = "P";
  booking.callToAction = false;
  $scope.booking = booking;

  $ionicModal.fromTemplateUrl('ok-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modalok = modal;
  })

  $scope.closeModalok = function() {
    $scope.modalok.hide();
    $state.go('tab.account');
  };

  $scope.$on('$destroy', function() {
    $scope.modalok.remove();
  });


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

  $scope.$on('currentDateChanged', function(event, x) {
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      MyObjects.findAvalabilities(m,y, booking.gameType)
      .then(
        function(results){
          avalabilities = results;
      }, function(error){
        console.log(error);
      })
  });

  $scope.$watch('booking.gameType',function(obj){
      MyObjects.findAvalabilities($scope.currentMonth, $scope.currentYear, booking.gameType)
      .then(
        function(results){
          avalabilities = results;
      }, function(error){
        console.log(error);
      })
  })

  $scope.showAddButton = false;

  $scope.getDayStatus = function(day){

    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    var m = parseInt($scope.currentMonth) + 1
    var selectedDate = new Date( $scope.currentYear + "/" + m + "/" + day);
    if (selectedDate < today )
      return "disabled";

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

    if ( ranges.length === 0 ){
      return;
    }
    else{
      $scope.selectedDay =  day;
      avalaibleRanges = ranges;
      selectedRanges = [];

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
    $scope.selectedHours = Utility.getHoursFromRanges(selectedRanges);

  }


  $scope.book = function(booking){

    if ($scope.selectedDay === null  || selectedRanges.length === 0) {
      $scope.resolved = "Selezionare giorno e fascia oraria."
      return;
    }

    if ($rootScope.userRole == 'segreteria' && booking.note === undefined){
      $scope.resolved = "Inserire il nome del giocatore."
      return;
    }

    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date($scope.currentYear + "/" + m + "/" + $scope.selectedDay);
    booking.date = date;
    booking.ranges = selectedRanges;

    MyObjects.createBooking(booking)
    .then(
      function(result){

      $scope.resolved = "Prenotazione Effettuata!";
      $scope.booking = result
      $scope.modalok.show();

    }, function(error){

      console.log(error);
      $scope.resolved = "Oooops! L'orario non è più disponibile!"
      $scope.$apply();
    })
    selectedRanges = [];

  }


})

  .controller('AccountCtrl', function($scope,MyObjects, $state,$ionicModal,$rootScope) {
    var currentLevel = {value: $rootScope.currentUser.get('level')}
    $scope.currentLevel = currentLevel

    $ionicModal.fromTemplateUrl('set-level.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.setLevelModal = modal;
      console.log($scope.setLevel);
    })

    $ionicModal.fromTemplateUrl('reset-pwd.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.resetPwdModal = modal;


    })


    $scope.changeLevel = function(){
      $scope.setLevelModal.show();
    }

    $scope.confirmChangeLevel = function(){

      var currentUser = Parse.User.current();
      currentUser.set('level' , parseInt($scope.currentLevel.value));
      currentUser.save()
      .then(
        function(obj){

      }, function(error){
        console.log(error);
      })

      $scope.setLevelModal.hide();

    }


    $scope.resetPwd = function(){
      console.log('ooo');
      $scope.resetPwdModal.show();
    }

    $scope.confirmResetPwd = function(){
      var email = Parse.User.current().get('email')
      Parse.User.requestPasswordReset(email, {
          success: function() {
          // Password reset request was sent successfully
          Parse.User.logOut();
          },
          error: function(error) {
            // Show the error message somewhere
            alert("Error: " + error.code + " " + error.message);
          }
        });

      $scope.resetPwdModal.hide();
    }


  MyObjects.findMyBookings()
  .then(
    function(results){
      $scope.bookings = results

  }, function(error){
    console.log(error);
  })

  MyObjects.findCallToActionWithUserAsPlayer()
  .then(
    function(results){
      console.log(results);
      $scope.callToActions = results

  }, function(error){
    console.log(error);
  })

  $scope.delete = function(item){

    MyObjects.deleteBooking(item);
    MyObjects.findMyBookings()
    .then(
      function(results){
        $scope.bookings = results

    }, function(error){
      console.log(error);
    })

    MyObjects.findCallToActionWithUserAsPlayer()
    .then(
      function(results){
        console.log(results);

    }, function(error){
      console.log(error);
    })



  }

  $scope.gotoStatistics = function(){
    $state.go('tab.statistics');
  }

  $scope.gotoUserToEnable = function(){
    $state.go('tab.userToEnable');
  }



})

.controller('statistics', function($scope, MyObjects,$ionicModal,$ionicLoading){

  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  $scope.$on('currentDateChanged', function(event, x) {
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      $scope.selectedDay = null;

  });

  $scope.getDayStatus = function(day){

    if ($scope.selectedDay == day){
      return "selected";
    }
    else {
      return 'na'
    }
  };

  $scope.dayClicked = function(day){
    $ionicLoading.show({
      template: 'Loading...'
    });
    $scope.selectedDay =  day;
    console.log('dayClicked' + day);
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + day
    MyObjects.findStatistics(new Date(datex))
    .then(
      function(obj){
        console.log(obj);
        $scope.results = obj;
        $ionicLoading.hide();
    }, function(error){
      console.log(error);
    })
  }

})


.controller('callToAction', function($scope, MyObjects,$ionicModal, config) {

  $ionicModal.fromTemplateUrl('ok-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.mayIJoin = function(cta){
    return _.inRange(Parse.User.current().get('level'), cta.level - 1, parseInt(config.playersLevels) + 1) ;
  }


  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });


  MyObjects.findCallToAction()
  .then(
    function(results){
      $scope.callToActionOpen = results
  }, function(error){
    console.log(error);
  })


  $scope.add = function(cta){


    MyObjects.addCallToActionPlayer(cta)
    .then(
      function(obj){

        $scope.modal.show();
        MyObjects.findCallToAction()
        .then(
          function(results){

            $scope.callToActionOpen = results
        }, function(error){
          console.log(error);
        })

      //  $scope.$apply();

    }, function(error){
      console.log(error);
    })

  }

})

//{date: new Date(d), ranges:selectedRanges, maestro:maestro1}
//Funzione disponibile solo a Maestro!!!!
.controller('SetAvalability', function($scope, $stateParams, Utility, MyObjects) {

  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  var avalabilities = [];
  $scope.avalabilities = avalabilities;

  var currentUser = Parse.User.current();
  var maestro = currentUser.get('maestro');

  $scope.$on('currentDateChanged', function(event, x) {
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      MyObjects.getDisponibilitaCoach(m,y, maestro.id).then(
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
        return (obj.date == day);
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
        return (obj.date == day);
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
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    var m = parseInt($scope.currentMonth) + 1
    var selectedDate = new Date( $scope.currentYear + "/" + m + "/" + day);
    if (selectedDate < today )
      return "disabled";

    var e = _.find(avalabilities,function(obj){

        return (obj.date == day);
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

    if (selectedDays.length === 0 || selectedRanges.length === 0){
      $scope.mymessage = "Occorre selezionare almeno un giorno ed una fascia oraria...."
      return;
    }


    var m = parseInt($scope.currentMonth) + 1;
    _.each(selectedDays,function(value, key, list){

      var d = $scope.currentYear + "/" + m + "/" + value;

      MyObjects.addDisponibilitaCoach({date: new Date(d), ranges:selectedRanges}).then(
        function(result){
          avalabilities.push({objectId:result.id, date: value, ranges:selectedRanges})
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

})

.controller('UserToEnable', function($scope, $stateParams, Utility, MyObjects,$state,$ionicLoading) {

  $ionicLoading.show({
    template: 'Loading...'
  });
  MyObjects.getUsersToEnable()
  .then(
    function(results){

      $scope.users=results
      //alert(results[0]);
      $scope.$apply();
      $ionicLoading.hide();

  }, function(error){
      console.log(error);
      $ionicLoading.hide();
  })

  $scope.enableUser = function(user){
    console.log(user);
    Parse.Cloud.run('modifyUser', {objectId:user.id}, {
      success: function(result) {
        console.log('ok');
        var index = _.findIndex($scope.users, function(item){
          console.log(item);
          return item.id == user.id
        })
        $scope.users.splice(index,1);
        console.log($scope.users);
        //$scope.users = users
        //$state.go('tab.userToEnable')
        $scope.$apply();
        //console.log($scope.users);
      },
      error: function(error) {
        console.log(error);

      }
    })

  }

})

.controller('WaitingToBeEnabled',function($scope, $stateParams, Utility, MyObjects,$state,$ionicModal) {

  $ionicModal.fromTemplateUrl('signup-ok-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.show()
  })




  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });


$scope.ok = function(){
  console.log('ok');
  Parse.User.logOut();
  $state.go('login');
}
})
