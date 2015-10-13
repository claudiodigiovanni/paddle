angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, MyObjects, Utility,$ionicModal, $rootScope,$ionicDeploy) {



//*********************INSTALL NEW UPDATE *************************************


//*********************FINE NEW UPDATE *************************************

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

.controller('Login', function($scope, $stateParams, config,$state, $ionicModal,$ionicBackdrop, $timeout, $rootScope,$ionicLoading,$ionicUser, $ionicPush, $log) {

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


/*identifyUser = function() {
  $log.info('Ionic User: Identifying with Ionic User service');

  var user = $ionicUser.get();
  if(!user.user_id) {
    // Set your user_id here, or generate a random one.
    console.log(Parse.User.current().id);
    user.user_id = Parse.User.current().id
  }

  // Add some metadata to your user object.
  angular.extend(user, {
    name: Parse.User.current().get('email'),
    bio: 'I come from planet Ion'
  });

  // Identify your user with the Ionic User Service
  $ionicUser.identify(user).then(function(){
    //$scope.identified = true;
    console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
  });
};

pushRegister = function() {
  $log.info('Ionic Push: Registering user.....xxxx');

  // Register with the Ionic Push service.  All parameters are optional.
  $ionicPush.register({
    canShowAlert: true, //Can pushes show an alert on your screen?
    canSetBadge: true, //Can pushes update app icon badges?
    canPlaySound: true, //Can notifications play a sound?
    canRunActionsOnWake: true, //Can run actions outside the app,
    onNotification: function(notification) {
      // Handle new push notifications here
      $log.info(notification);
      return true;
    }
  })
}

$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        console.log("Successfully registered token " + data.token);
        console.log('Ionic Push: Got token ', data.token, data.platform);
        //$rootScope.token = data.token;
        console.log('localStorage deviceToken:' + data.token );
        window.localStorage['deviceToken'] = data.token

        registerToken(currentUser.username.toLowerCase(),data.token)
});

registerToken = function(username, token){

  var Token = Parse.Object.extend("Token");
  var query = new Parse.Query(Token);
  query.equalTo("username",username)
  query.first()
  .then(
    function(obj){
      if (obj == null){
        var t = new Token();
        t.set("username",username)
        t.set("token",token)
        t.save();
      }
      else{
        obj.set("token",token)
        obj.save();
      }
  }, function(error){
    console.log(error);
  })


}

*/


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
          //$state.go('tab.dash');
          $state.go('tab.dash');
          //***********************************************************
          var Circolo = Parse.Object.extend("Circolo");
          var query = new Parse.Query(Circolo);
          query.get($rootScope.currentUser.get('circolo').id)
          .then(
            function(obj){

                var gameTypes = []
                gameTypes.push(obj.get('gameType1'))
                gameTypes.push(obj.get('gameType2'))
                gameTypes.push(obj.get('gameType3'))
                window.localStorage['gameTypes'] = JSON.stringify(gameTypes)
                window.localStorage['circolo'] = obj.get('nome')


          }, function(error){
            console.log(error);
          })
          //***********************************************************

          //TODO
          //identifyUser();
          //pushRegister();


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


  $scope.modal.show();
}

$scope.gotoSignUp = function(){
  $scope.modal.hide();
  $state.go('signUp');
}

$scope.logOut = function(form) {
  Parse.User.logOut();
  $scope.currentUser = null;
  $state.go('login');
};

})

.controller('SignUp', function($scope, $stateParams, config,$state,$ionicModal, $ionicLoading, $rootScope,$http,vcRecaptchaService,MyObjects) {

//$scope.currentUser = Parse.User.current();
var currentUser = {level:3}
$scope.currentUser = currentUser;
$scope.registered = false;

MyObjects.getCircoli()
.then(
  function(obj){
    $scope.circoli = obj
    $scope.$apply()

}, function(error){
  console.log(error);
})


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

  if ( currentUser.email === null || currentUser.email === undefined || currentUser.password === null || currentUser.username === null || currentUser.circolo === undefined){
    console.log(currentUser.email);
    mymessage.text = "Occorre inserire email, username, password e circolo..."
    $ionicLoading.hide();
    return
  }


  var e = currentUser.email.toLowerCase()
  var u = currentUser.username.toLowerCase()
  var n = currentUser.nome
  var p = currentUser.password
  var l = currentUser.level
  var c = currentUser.circolo


  console.log(currentUser);

  Parse.Cloud.run('signUp', {email:e, username:u, password:p,level:l ,nome:n, circolo:c, captchaResponse: $scope.captchaResponse, platform: $rootScope.platform}, {
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


.controller('BookCourt', function($scope, $stateParams, config,Utility, MyObjects, $ionicModal, $state,$rootScope,$ionicPopup, $ionicPopover) {

  var toggleCoach = {value:false}
  $scope.toggleCoach = toggleCoach


  var currentDate = new Date();
  var currentMonth = parseInt(currentDate.getMonth())  ;
  var currentYear = currentDate.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  $scope.coachAvalabilities = []

  var avalaibleRanges = [];
  var selectedRanges = [];

  $scope.showAddButton = false;


  var booking = {};
  booking.gameType = "0";
  booking.callToAction = false;
  $scope.booking = booking;



  //*************************SEZIONE MODAL*******************************************************
  $ionicModal.fromTemplateUrl('coaches-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.coachesModal = modal;
  })

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

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.$on('currentDateChanged', function(event, x) {
      console.log('currentDateChanged');
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y
      selectedRanges = [];
      $scope.coachAvalabilities = []
      $scope.selectedDay = null

  });

  $scope.$watch('booking.gameType',function(obj){

  })


  $scope.openModal = function() {
    selectedRanges = [];
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
    selectedRanges = [];
    $scope.selectedHours = ""
    //$scope.$apply();
  };

  $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.gotoInvitation = function(){
    $state.go('tab.invitation',{'bookingId':$scope.booking.id})
  }

  //***************************FINE SEZIONE MODAL*****************************************************

  $scope.toggleChange = function(){



    if ($scope.toggleCoach.value == true){

      MyObjects.getCoaches().then(function(results){
        $scope.coaches = results
        $scope.coachesModal.show();
      },function(error){
        console.log(error);
      })

    }

    else {
      //console.log(false);

      booking.maestro = null
      $scope.coachAvalabilities = []
      avalaibleRanges = []
    }
  }


  $scope.selectCoach = function(coach){



    console.log(coach);
    booking.maestro = coach
    $scope.coachesModal.hide();
    console.log('selectCoach 2222');
    // coachAvalabilities ==> [{day:d.get('date').getDate(),range:r}]
    MyObjects.getCoachAvalabilitiesFilteredByBookings($scope.currentMonth,$scope.currentYear,coach.id, booking.gameType )
    .then(
      function(results){
        $scope.coachAvalabilities = results
        //console.log(results);
        $scope.$apply()
    }, function(error){
      console.log(error);
    })


  }

  $scope.closeCoachesModal = function(){

    $scope.toggleCoach.value = false
    booking.maestro = null
    $scope.coachAvalabilities = []
    $scope.coachesModal.hide();
    avalaibleRanges = []

  }


  $scope.dayClicked = function(day){

    if (day == "-")
      return;



    console.log('dayClicked' + day);
    selectedRanges = [];
    $scope.resolved = null;
    $scope.avalaivableCourts = null
    $scope.showAddButton = false;
    $scope.selectedDay =  day;

    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + day;
    var date = new Date(d);

    if(booking.maestro != null){
      //coachAvalabilities => [{day:d.get('date').getDate(),range:r}]
      var x = _.filter($scope.coachAvalabilities, function(item){
          if (item.day == day ){
            return item
          }

      })
      avalaibleRanges = _.pluck(x,'range')
      $scope.showAddButton = true;
      $scope.modal.show()
    }
    else{

      // [range]
      MyObjects.findaAvalaibleRangesInDate(date,booking.gameType)
      .then(
        function(ranges){
          avalaibleRanges = ranges;
          $scope.showAddButton = true;

          $scope.modal.show()

      }, function(error){
        console.log(error);
      })
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
    $scope.avalaivableCourts=null;
    //alert('getRangeStatus' + pos);
    //console.log(avalaibleRanges);

    if (avalaibleRanges.indexOf(pos) == -1){
      return
    }

    if (selectedRanges.indexOf(pos) != -1){
      selectedRanges.splice(selectedRanges.indexOf(pos),1);


    }
    else {
        selectedRanges.push(pos);
    }

    if (selectedRanges.length == 0){
      $scope.avalaivableCourts = null
      return
    }



    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date(d);

    MyObjects.checkBeforeCreateBooking(date, selectedRanges, booking.gameType)
    .then(
      function(obj){

        $scope.avalaivableCourts = obj
        console.log('avalaivableCourts');

    }, function(error){
      console.log(error);

      var alertPopup = $ionicPopup.alert({
         title: 'Opsss!',
         template: 'Nessun campo disponibile nelle fascie orarie selezionate...'
       });
       alertPopup.then(function(res) {
         console.log('Thank you for not eating my delicious ice cream cone!');
         selectedRanges = [];
       });

    })

    $scope.selectedHours = Utility.getHoursFromRanges(selectedRanges);

  }


  $scope.book = function(){

    if ($scope.selectedDay === null  || selectedRanges.length === 0) {
      $scope.resolved = "Selezionare la fascia oraria."
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

    console.log(booking);

    MyObjects.createBooking(booking)
    .then(
      function(result){

      $scope.modal.hide();

      $scope.resolved = "Prenotazione Effettuata!";
      $scope.booking = result
      $scope.modalok.show();

    }, function(error){

      console.log(error);
      $scope.resolved = "Oooops! L'orario non è più disponibile!"

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
          console.log(obj);

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
      $state.go('login')
    }


  MyObjects.findMyBookings()
  .then(
    function(results){

      $scope.bookings = results
      $scope.$apply()

  }, function(error){
    console.log(error);
  })


  MyObjects.findMyInvitations()
  .then(
    function(results){

      $scope.invitations = results
      $scope.$apply()

  }, function(error){
    console.log(error);
  })



  $scope.accept = function(invitation){

    MyObjects.acceptInvitation(invitation)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })

  }

  $scope.decline = function(invitation){

    MyObjects.declineInvitation(invitation)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })

  }




  $scope.delete = function(item){

    console.log('delete');

    MyObjects.deleteBooking(item)
    MyObjects.findMyBookings()
    .then(
      function(results){
        $scope.bookings = results
        $scope.$apply()
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

  $scope.manageSubscriptions = function(){
    $state.go('tab.manageSubscriptions');
  }


})

.controller('statistics', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility){

  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  $scope.date = Utility.formatDate(today)

  var currentMonth = parseInt(today.getMonth())  ;
  var currentYear = today.getFullYear();
  $scope.currentMonth = currentMonth;
  $scope.currentYear = currentYear;

  MyObjects.findBookingsForSegreteria(today)
  .then(
    function(results){
      $scope.results = results

  }, function(error){
    console.log(error);
  })



  $scope.$on('currentDateChanged', function(event, x) {
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      $scope.selectedDay = null;

  });

  $scope.pay = function(booking){

    MyObjects.payBooking(booking)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })

  };

  $scope.dayClicked = function(day){

    $scope.selectedDay =  day;
    console.log('dayClicked' + day);
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + day
    $scope.date = Utility.formatDate(new Date(datex))

    MyObjects.findBookingsForSegreteria(new Date(datex))
    .then(
      function(results){
        $scope.results = results

    }, function(error){
      console.log(error);
    })

  }

})

.controller('callToAction', function($scope, MyObjects,$ionicModal, config,$ionicPopup) {

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
      $scope.$apply()
  }, function(error){
    console.log(error);
  })


  $scope.add = function(cta){


    MyObjects.addCallToActionPlayer(cta)
    .then(
      function(obj){
        MyObjects.findCallToAction()
        .then(
          function(results){
            $scope.callToActionOpen = results
            $scope.$apply()
        }, function(error){
          console.log(error);
        })

    }, function(error){
      console.log(error);
      var alertPopup = $ionicPopup.alert({
         title: 'Opsss!',
         template: error
       });
       alertPopup.then(function(res) {
         console.log('Thank you for not eating my delicious ice cream cone!');
         selectedRanges = [];
       });
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

  var coachAvalabilities = [];
  $scope.coachAvalabilities = coachAvalabilities;

  var currentUser = Parse.User.current();
  var maestro = currentUser.get('maestro');

  $scope.$on('currentDateChanged', function(event, x) {
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      MyObjects.getDisponibilitaCoachForCalendar(m,y, maestro.id).then(
        function(ret){
          //console.log(ret);
          //coachAvalabilities ==>[{day:d.get('date').getDate(),range:ranges}]
          $scope.coachAvalabilities = ret;
          $scope.$apply()
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

    var day = $scope.selectedDay;
    var ix = _.findIndex($scope.coachAvalabilities,function(obj){
        return (obj.day == day);
    });

    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + day;
    var date = new Date(d);

    MyObjects.deleteDisponibilitaCoach(date)
    $scope.coachAvalabilities.splice(ix ,1);
    selectedRanges = [];
    $scope.showDeleteButton = false;

  }


  $scope.dayClicked = function(day){

    $scope.showDeleteButton = false;

    if (day == "-")
      return;

    $scope.selectedDay = day;
    //coachAvalabilities ==>[{day:d.get('date').getDate(),range:ranges}]
    var e = _.find($scope.coachAvalabilities,function(obj){
        return (obj.day == day);
    });

    if ( e ){
      //booked.splice(e,1);
      selectedRanges = e.range;
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
    $scope.selectedDays = selectedDays
    console.log(selectedDays);
  }


  $scope.addRange = function(range){

    if (selectedDays.length === 0 || selectedRanges.length === 0){
      $scope.mymessage = "Occorre selezionare almeno un giorno ed una fascia oraria...."
      return;
    }

    console.log($scope.coachAvalabilities);
    var m = parseInt($scope.currentMonth) + 1;
    _.each(selectedDays,function(value, key, list){

      var d = $scope.currentYear + "/" + m + "/" + value;

      MyObjects.addDisponibilitaCoach({date: new Date(d), ranges:selectedRanges}).then(
        function(result){
          //coachAvalabilities ==>[{day:d.get('date').getDate(),range:ranges}]
          $scope.coachAvalabilities.push({day: value, range:selectedRanges})
          $scope.selectedDays = [];
          $scope.selectedRanges = [];
          $scope.selectedDay= null;
          $scope.$apply();
      }, function(error){

        $scope.selectedDays = [];
        $scope.selectedRanges = [];
        $scope.selectedDay= null;
        $scope.$apply();
      })

    })

  }

})

.controller('UserToEnable', function($scope, $stateParams, Utility, MyObjects,$state,$ionicLoading,$ionicPopup) {

  $ionicLoading.show({
    template: 'Loading...'
  });
  MyObjects.getUsersToEnable()
  .then(
    function(results){
      console.log(results);
      $scope.users=results
      //alert(results[0]);
      //$scope.$apply();
      $ionicLoading.hide();

  }, function(error){
      console.log(error);
      $ionicLoading.hide();
  })

  $scope.enableUser = function(user){
    console.log(user);
    MyObjects.enableUser(user)
    .then(
      function(obj){
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
        var alertPopup = $ionicPopup.alert({
           title: 'ok',
           template: 'Utente abilitato....!'
         });
         alertPopup.then(function(res) {

         });

    }, function(error){
      console.log(error);
    })

  }

})

.controller('manageSubscribtions',function($scope, $stateParams, Utility, MyObjects,$state,$ionicModal,$ionicPopup) {

MyObjects.getCircoli()
.then(
  function(obj){
    $scope.subscriptions = obj
    $scope.circolo = _.find(obj,function (item){
      return item.id == Parse.User.current().get('circolo').id
    })
    $scope.$apply()
}, function(error){
  console.log(error);
})

$scope.setAsDefault = function(circolo){

  Parse.User.current().set("circolo",circolo)
  Parse.User.current().save()
  .then(
    function(obj){
      $scope.circolo = circolo
      window.localStorage['circolo'] = circolo.get('nome')
      $scope.$apply()
      var alertPopup = $ionicPopup.alert({
         title: 'ok',
         template: 'Modificato il circolo predefinito'
       });
      alertPopup.then(function(res) {});
  }, function(error){
    console.log(error);
  })


}

$scope.subscribe = function(circolo){
  MyObjects.requestForSubscription(circolo)
  .then(
    function(response){
      console.log(response);
      var alertPopup = $ionicPopup.alert({
         title: 'ok',
         template: 'Richiesta di iscrizione inviata...!'
       });
      alertPopup.then(function(res) {});

  }, function(error){
    console.log(error);

    var alertPopup = $ionicPopup.alert({
       title: 'ok',
       template: 'Richiesta di iscrizione già inviata in passato...!'
     });
    alertPopup.then(function(res) {});
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

.controller('InvitationCtrl',function($scope, $stateParams, Utility, MyObjects,$state,$ionicModal) {

  var model = {name:""}
  $scope.model = model

  $scope.bookingId = $stateParams.bookingId

  console.log($scope.bookingId);

  $scope.change = function(){

    console.log($scope.model.name.length);

    if ($scope.model.name != null && $scope.model.name.length > 3){

      MyObjects.findPlayersWithName($scope.model.name)
      .then(
        function(results){
          console.log(results);
          $scope.players = results
          $scope.$apply()

      }, function(error){
        console.log(error);
      })
    }
  }

  $scope.invite = function(userId){
    console.log('invitation');
    MyObjects.invite(userId,$scope.bookingId)
    .then(
      function(obj){
        console.log('ok');
        return MyObjects.findInvitationAlredySentForBooking($scope.bookingId)
    }, function(error){
      console.log(error);
    })
    .then(
      function(obj){
        console.log(obj);
        $scope.invitations = obj
        //$scope.$apply()
    }, function(error){
      console.log(error);
    })




  }

})
