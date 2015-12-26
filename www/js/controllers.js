
angular.module('starter.controllers', []) 

.controller('checkNewVersionCtrl', function($scope, MyObjects, Utility,$ionicModal, $rootScope) {

  //*********************INSTALL NEW UPDATE *************************************

    var deploy = new Ionic.Deploy();
    var spinnerVisible = true
    var message = ""
    $scope.message = message
    $scope.spinnerVisible = spinnerVisible
  
    // Update app code with new release from Ionic Deploy
    var doUpdate = function() { 
      deploy.update().then(function(res) {
        $scope.message = "L'aggiornamento ha avuto successo!"
        $scope.spinnerVisible = false
        $scope.$apply()
      }, function(err) {
         $scope.message = "L'aggiornamento NON ha avuto successo!"
         $scope.spinnerVisible = false
         $scope.$apply()
      }, function(prog) {
         $scope.message = "Aggiornamento in corso...."
         $scope.$apply()
      });
    };

     $scope.message = "Controllo l'esistenza di aggiornamenti"
      deploy.check().then(function(hasUpdate) {
        if (hasUpdate){
          $scope.message = "Aggiornamento disponibile!"
          doUpdate();
          $scope.$apply()
        }
        else{
          $scope.message = "Nessun aggiornamento disponibile!"
          $scope.spinnerVisible = false
          
          $scope.$apply()
        }
        
        
      }, function(err) {
        $scope.message = "Opssss....si è verificato un errore...."
        $scope.spinnerVisible = false
        $scope.$apply()
      });
      
      
   

//*********************FINE NEW UPDATE *************************************

})

.controller('DashCtrl', function($scope, MyObjects, Utility,$ionicModal, $rootScope) {




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

        //$scope.text = text
        $scope.text0 = text[0]
        $scope.text1 = text[1]
        $scope.text2 = text[2]

  }, function(error){
    console.log(error);
  })


  $scope.closeModal = function() {
    $scope.modal.hide();
    MyObjects.saveDashboardText($scope.index,edit.text)
    var myx = "text" + $scope.index
    $scope[myx] = edit.text
    //$state.go('tab.account');
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.openModal = function(index) {
    var myx = "text" + index
    edit.text = $scope[myx]
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

$scope.closeResetPwd = function(){
  $scope.resetPwdModal.hide()
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

$scope.closeSignupx = function(){
    
    $state.go('login');
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
  var x = currentUser.phoneNumber
  var y = currentUser.codfis


  console.log(currentUser);

  Parse.Cloud.run('signUp', {email:e, username:u, password:p,level:l ,nome:n, circolo:c, codfis:y,
                            captchaResponse: $scope.captchaResponse, platform: $rootScope.platform, phoneNumber:x }, {
    success: function(user) {
      //$scope.modal.hide();
      $ionicLoading.hide();
      //Parse.User.logOut();
      $state.go('waitingToBeEnabled');
    },
    error: function(error) {
      $ionicLoading.hide();
      mymessage.text = error;
      console.log(error);
    }
  })


};

})


.controller('BookCourt', function($scope, $stateParams, config,Utility, MyObjects, $ionicModal, $state,$rootScope,$ionicPopup, $ionicPopover,$ionicLoading) {

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

      $scope.toggleCoach.value = false
      booking.maestro = null
      avalaibleRanges = []

  });

  $scope.getGameType = function(index){
    if (index == booking.gameType )
      return "balanced"
    return "dark"
  }

  $scope.setGameType = function(index){
    booking.gameType = index
  }

  
  

  $scope.$watch('booking.gameType',function(obj){
    console.log('$watch on booking.gameType...');
    console.log(booking.gameType)
    $scope.toggleCoach.value = false
    booking.maestro = null
    $scope.coachAvalabilities = []
    avalaibleRanges = []


    $scope.numberPlayers = $rootScope.gameTypes[booking.gameType].numberPlayers
    console.log('numberPlayers....' + $scope.numberPlayers )

    //Assegno un default
    booking.playersNumber = $scope.numberPlayers[0]

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
    
    $scope.modalok.hide();
    $state.go('invitation',{'bookingId':$scope.booking.id,'gameType':$scope.booking.get('gameType')})
  }

  //***************************FINE SEZIONE MODAL*****************************************************



  $scope.toggleCoach = function(){



    if ($scope.toggleCoach.value == true){

      MyObjects.getCoaches().then(function(results){
        $scope.coaches = results
        $scope.coachesModal.show();
      },function(error){
        console.log(error);
      })

    }

    else {
      booking.maestro = null
      $scope.coachAvalabilities = []
      avalaibleRanges = []
    }
  }


  $scope.selectCoach = function(coach){

    console.log(coach);
    booking.maestro = coach
    $scope.coachesModal.hide();

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
    
    console.log(booking.gameType)
    selectedRanges = [];
    $scope.resolved = null;
    $scope.avalaivableCourts = null
    $scope.showAddButton = false;
    $scope.selectedDay =  day;



    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + day;
    var date = new Date(d);

    //Usato dalla direttiva Weather
    $scope.selectedDate = date

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

      console.log(booking.gameType)

    
      //booking.gameType + di tipo string....
      MyObjects.findaAvalaibleRangesInDate(date, booking.gameType)
      .then(
        function(ranges){
          avalaibleRanges = ranges;
          console.log("avalaibleRanges length:" + avalaibleRanges.length)
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
        console.log(obj);

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

    $ionicLoading.show({
          template: 'Please wait...'
    });

    var m = parseInt($scope.currentMonth) +1 ;
    var d = $scope.currentYear + "/" + m + "/" + $scope.selectedDay;
    var date = new Date($scope.currentYear + "/" + m + "/" + $scope.selectedDay);
    booking.date = date;
    booking.ranges = selectedRanges;

    //console.log(booking);

    MyObjects.createBooking(booking)
    .then(
      function(result){
      $ionicLoading.hide();

      $scope.modal.hide();

      $scope.resolved = "Prenotazione Effettuata!";
      $scope.booking = result
      $scope.modalok.show();

    }, function(error){

      $ionicLoading.hide();
      console.log(error);
      $scope.resolved = "Oooops! L'orario non è più disponibile!"

    })
    selectedRanges = [];

  }


})

.controller('changeLevelCtrl',function($scope,$state,$rootScope){
    var currentLevel = {value: $rootScope.currentUser.get('level')}
    $scope.currentLevel = currentLevel

    $scope.confirmChangeLevel = function(){

      var currentUser = Parse.User.current();
      currentUser.set('level' , parseInt($scope.currentLevel.value));
      currentUser.save()
      .then(
        function(obj){
          console.log(obj);
          $state.go('tab.account')

      }, function(error){
        console.log(error);
      })

      

    }
})

.controller('resetPwdCtrl',function($scope,$state,$rootScope){
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

      $state.go('login')
    }
      

    
})

  .controller('AccountCtrl', function($scope,MyObjects, $state,$ionicModal,$rootScope,$ionicPopup,$ionicListDelegate,$timeout,$ionicLoading) {
    var currentLevel = {value: $rootScope.currentUser.get('level')}
    $scope.currentLevel = currentLevel


    

    var init = function(){

        Parse.User.current().fetch()

        MyObjects.findMyBookings()
        .then(
          function(results){
            $scope.bookings = results
        }, function(error){
          console.log(error);
          var alertPopup = $ionicPopup.alert({
             title: 'Opsss!',
             template: error 
           });
        })

        MyObjects.findMyInvitations()
        .then(
          function(results){
            $scope.invitations = results
        }, function(error){
          console.log(error);
          var alertPopup = $ionicPopup.alert({
             title: 'Opsss!',
             template: error 
           });
        })

       MyObjects.findMyGameNotPayed()
        .then(
          function(results){
            $scope.gameNotPayed = _.flatten(results)
        }, function(error){
          console.log(error);
          var alertPopup = $ionicPopup.alert({
             title: 'Opsss!',
             template: error 
           });
        })

    }

    //***************************************
    init()
    //***************************************
    
  $scope.accept = function(invitation){
    $ionicLoading.show({
          template: 'Loading...'
        });
    MyObjects.acceptInvitation(invitation)
    .then(
      function(obj){
        init()
        $ionicLoading.hide()
    }, function(error){
        console.log(error);
        $ionicLoading.hide()
    })
    
  }

  $scope.decline = function(invitation){
    $ionicLoading.show({
        template: 'Loading...'
      });
    MyObjects.declineInvitation(invitation)
    .then(
      function(obj){
        init()
        $ionicLoading.hide()
    }, function(error){
      console.log(error);
      $ionicLoading.hide()
    })
    
  }

  $scope.info = function(){
      $ionicPopup.alert({
         title: 'Info',
         template: "Trascina verso destra l'elemento per visualizzare le opzione disponibili." 
       });
    }

  $scope.infoPayment = function(){
    $ionicPopup.alert({
       title: 'Info',
       template: "Trascina verso destra l'elemento per visualizzare le opzioni disponibili. Anche se hai pagato la tua quota potresti continuare a vedere la prenotazione in quest'area perchè la segreteria non ha ricevuto tutte le restanti quote." 
     });
  }

  


  $scope.delete = function(item){
   $ionicLoading.show({
          template: 'Loading...'
        });
    MyObjects.deleteBooking(item)
    .then(function(){
      init()
      $ionicLoading.hide()
    })
  }

  $scope.payMyBooking = function(booking){
    //Pago la mia quota ma non posso mettere payed a true perchè è possibile che altri debbano pagare.
   $ionicLoading.show({
          template: 'Loading...'
        });
    MyObjects.payMyBooking(booking).then(function(ret){
      $ionicListDelegate.closeOptionButtons()
      $ionicLoading.hide()

    })
    
  }

  $scope.gotoStatistics = function(){
    $state.go('statistics');
  }
  
  $scope.gotoUserToEnable = function(){
    $state.go('userToEnable');
  }

  $scope.manageSubscriptions = function(){
    $state.go('tab.manageSubscriptions');
  }

  $scope.doRefresh = function(){

    init();
    $timeout(function() {
      $scope.$broadcast('scroll.refreshComplete');
    }, 2000)
}


  $scope.gotoUserMgmt = function(){

    $state.go('manageUsers')
  }


})

.controller('manageUsers', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility,$state){

  var recharge = {qty:""}
  var userToSearch = {nome:""}


  $scope.recharge = recharge
  $scope.userToSearch = userToSearch

  $ionicModal.fromTemplateUrl('recharge.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.rechargeModal = modal;

    })

    $ionicModal.fromTemplateUrl('payments.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.paymentsModal = modal;

    })

    $scope.findUsers = function(){
        $scope.message = ""
        MyObjects.findPlayersWithName($scope.userToSearch.nome)
        .then(function(ret){
          $scope.myresults = ret
          if (ret.length == 0)
            $scope.message = "Nessun utente trovato..."
        })

    }

  
    $scope.getRecharges = function(user){
          console.log('openRecharge')
          $scope.user = user
          MyObjects.getRecharges(user)
        .then(function(results){
          $scope.recharges = results
          $scope.rechargeModal.show()
        })
      }

    $scope.getPayments = function(user){
          console.log('openPayment')
          $scope.user = user
          MyObjects.getPayments(user)
        .then(function(results){
          $scope.payments = results
          $scope.paymentsModal.show()
        })
      }

      $scope.closePaymentModal = function(){
        $scope.paymentsModal.hide()
      }

      $scope.closeRechargeModal = function(user){

          MyObjects.findPlayersWithName($scope.userToSearch.nome)
          .then(function(ret){
            $scope.rechargeModal.hide()
            $scope.myresults = ret
            if (ret.length == 0)
              $scope.message = "Nessun utente trovato..."
          })
          
      }

      $scope.addCharge = function(){
        MyObjects.addCharge($scope.user,$scope.recharge.qty)
        .then(function(ret){
           return MyObjects.getRecharges($scope.user)
          })
          .then(function(results){
            $scope.recharges = results
        })
      }

      $scope.enabling = function(user){

        console.log(user);
        MyObjects.enabling(user)
        .then(function(ret){
          MyObjects.findPlayersWithName($scope.userToSearch.nome)
        .then(function(ret){
          $scope.myresults = ret
          if (ret.length == 0)
            $scope.message = "Nessun utente trovato..."
        })
        })

      }

      $scope.gotoAccount = function(){

        $state.go ('tab.account')
      }

      $scope.getUsersToEnable = function(){

      $ionicLoading.show({
        template: 'Loading...'
      });
      MyObjects.getUsersToEnable()
      .then(
        function(results){
          
          $scope.myresults = results
          if (results.length == 0)
            $scope.message = "Nessun utente trovato..."
          $ionicLoading.hide();

      }, function(error){
          console.log(error);
          $ionicLoading.hide();
      })
      }
  })
    

.controller('statistics', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility,$state){


  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

  $scope.date = Utility.formatDate(today)

  $scope.selectedDay = today.getDate()

  console.log($scope.selectedDay)

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
      console.log('on currentDateChanged.....')
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

  $scope.delete = function(item){

    console.log('delete');
    
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + $scope.selectedDay

    MyObjects.deleteBooking(item)
    .then(function(item){
      return MyObjects.findBookingsForSegreteria(new Date(datex))
    })
    .then(
      function(results){
        $scope.results = results
        //$scope.$apply()
    }, function(error){
      console.log(error);
    })

  }

  $scope.dayClicked = function(day){

    $scope.selectedDay =  day;
    /*console.log('dayClicked' + day);
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + day
    $scope.date = Utility.formatDate(new Date(datex))

    MyObjects.findBookingsForSegreteria(new Date(datex))
    .then(
      function(results){
        $scope.results = results

    }, function(error){
      console.log(error);
    })*/
    
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + $scope.selectedDay
    //console.log(datex)

    $state.go('courtsView',{'datez': datex, "gameType":$scope.gameType});

  }

  $scope.gotoCourtsView = function(){


    if ($scope.selectedDay == null){
      var today = new Date();
      $scope.selectedDay = today.getDate()
    }
    
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + $scope.selectedDay
    //console.log(datex)

    $state.go('courtsView',{'datez': datex, "gameType":$scope.gameType});

  }

  //default
  $scope.gameType = 0

  $scope.getGameType = function(index){
    if (index === $scope.gameType)
      return "balanced"
    else
      return "dark"

  }

  $scope.setGameType = function(index){
    $scope.gameType = index
    
  }

})

.controller('courtsView', function($scope, MyObjects,$ionicModal, config,$ionicLoading,$stateParams,$rootScope, Utility, $state) {

  var searchUser = {name: ""}
  $scope.searchUser = searchUser


  $ionicModal.fromTemplateUrl('bookingDetail.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $ionicModal.fromTemplateUrl('addPaymentTessera.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.addPaymentModal = modal;
  })

  $scope.openModal = function(booking) {

    console.log(booking)
    //*********************************Variabile usate per memorizzare la prenotazione selezionata********
    $scope.bookingx = booking
    $scope.bookingx.note = booking.get('note')
    MyObjects.getPaymentsByBooking(booking).then(
        function(results){
            
           $scope.payments = results
           $scope.modal.show();
    
      }, function(error){
        console.log(error);
      })
    
    //$state.go('tab.account');
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
    //MyObjects.saveDashboardText($scope.index,edit.text)
  };

  $scope.openAddPaymentTesseraModal = function(booking) {
    //console.log(booking)
    $scope.paymentTessera = {"qty":1}
    $scope.addPaymentModal.show();
    //$state.go('tab.account');
  };

  $scope.closeAddPaymentTesseraModal = function() { 
    MyObjects.getPaymentsByBooking($scope.bookingx).then(
        function(results){
           $scope.payments = results
           $scope.addPaymentModal.hide();
    
      }, function(error){
        console.log(error);
      })
  };

  $scope.searchUserForAddingPayment = function(){
    console.log('searchUserForAddingPayment');
    $scope.messageModalTessera = ""

    MyObjects.findPlayersWithName($scope.searchUser.name)
      .then(
        function(results){
          console.log(results);
          $scope.usersForAddingPayment = results
          if (results.length == 0)
            $scope.messageModalTessera = "Nessun utente trovato"
          $scope.$apply()
          

      }, function(error){
        console.log(error);
      })

  }

  var datex = $stateParams.datez
  var gameType = $stateParams.gameType
  $scope.datex = Utility.formatDate(new Date(datex))

//******************************Variabile usata per creare nuova prenotazione******************
  var mybooking = {};
  mybooking.gameType = gameType;
  mybooking.callToAction = false;
  mybooking.date = new Date(datex);
  $scope.mybooking = mybooking;

  var selectedRanges = []
  
  var court = 0
  mybooking.court = court

  var message = ""
  $scope.message = message
  

  var courtsNumber = $rootScope.gameTypes[gameType].courtsNumber
  $scope.courts = _.range(1,parseInt(courtsNumber) + 1)

  //console.log(datex)
  $ionicLoading.show({
    template: 'Loading...'
  });
  MyObjects.courtsView(new Date( datex), gameType)
  .then(function(results){

    $scope.myresults = results
    $ionicLoading.hide()
  })

  

   $scope.setRangeStatus = function(range,courtx){
    $scope.message = ""
    if (court != courtx)
      selectedRanges = []
    court = courtx
    if (selectedRanges.indexOf(range) != -1){
      selectedRanges.splice(selectedRanges.indexOf(range),1);
    }
    else {
      selectedRanges.push(range);
    }
    console.log(selectedRanges)
   }

   $scope.getRangeStatus = function(range,courtx){
    //alert('getRangeStatus' + pos);
    if (court == courtx && selectedRanges.indexOf(range) != -1){
      return "positive";
    }
      return "dark";
  }

  $scope.clear = function(){
    $scope.message = ""
  }

  $scope.payQuota = function(booking,type,qty){
            
      MyObjects.payBooking(booking,type,qty)
      //MyObjects.findBookings(2,2015)

    }

  $scope.payTessera = function(user){
    try{
        $ionicLoading.show({
          template: 'Loading...'
        });
        MyObjects.payTessera(user,$scope.bookingx,$scope.paymentTessera.qty)
        .then(function(ret){
          console.log('ok....')
          $scope.messageModalTessera = "Pagamento effettuato con successo!"
          $scope.usersForAddingPayment = []
          $ionicLoading.hide()
          //$scope.$apply()
        }, function(error){
                console.log(error)
                $scope.messageModalTessera = error
                $scope.usersForAddingPayment = []
                $ionicLoading.hide()
        })
    }
    catch(error){
      console.log(error)
      $scope.messageModalTessera = error
      $scope.usersForAddingPayment = []
      $ionicLoading.hide()

    }
    
  }

  $scope.saveNote = function(booking){
    console.log('saveNote...' + booking.note)
    MyObjects.saveNote(booking)
    //MyObjects.findBookings(2,2015)
  }


  $scope.setBookingPayed = function(booking){
    MyObjects.setBookingPayed(booking)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })
  };

  $scope.delete = function(mybooking){

    console.log('delete');
    //console.log(item)
    
    MyObjects.deleteBooking(mybooking)
    .then(function(){
      
      _.each(mybooking.get('ranges'), function(range,index){

          var row = _.find($scope.myresults, function(row){
              return row.range == range
          })
          var index = _.findIndex(row.courts[parseInt(mybooking.get('court')) - 1],function(b){
            return b.id == mybooking.id
          })
          row.courts[parseInt(mybooking.get('court')) - 1].splice(index,1);
          selectedRanges = []
          $scope.$apply()

      })
    },function(error){
      console.log(error)
    })

    $scope.modal.hide();
   
  }

  $scope.book = function(){

    if (selectedRanges.length === 0 || mybooking.note === undefined ) {
      $scope.message = "Selezionare la fascia oraria e inserire il nome del giocatore"
      return;
    }

    mybooking.ranges = selectedRanges;
    mybooking.court = court
    MyObjects.createBooking(mybooking)
    .then(
      function(result){
      //console.log('state.go....') 
      //$state.go('tab.courtsView',{'datez': datex});
      //MyObjects.courtsView(new Date( datex))
      _.each(mybooking.ranges, function(range,index){

          var row = _.find($scope.myresults, function(row){
              return row.range == range
          })
          row.courts[parseInt(mybooking.court) - 1].push(result)
          selectedRanges = []
          $scope.$apply()

      })

    }, function(error){
  
      console.log(error);
      $scope.message = "Oooops! C'è stato un problema...."

    })
  
    
  }

  $scope.deletePayment = function(payment){
    MyObjects.deletePayment(payment)
    .then(
      function(obj){
        return MyObjects.getPaymentsByBooking($scope.bookingx)
      }, function(error){
        console.log(error);
      })
    .then(
      function(results){
         $scope.payments = results
         var x = $scope.bookingx.get('payments')
         x['tessere'] = x['tessere'] - payment.get('qty')
         $scope.bookingx.set('payments',x)
      })
    
  };

  $scope.gotoStatistics = function(){
    $state.go ('statistics')
  }

  $scope.updateView = function(){
        //console.log(datex)
      $ionicLoading.show({
        template: 'Loading...'
      });
      MyObjects.courtsView(new Date( datex), gameType)
      .then(function(results){

        $scope.myresults = results
        $ionicLoading.hide()
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
      
       /* var gameTypes = []
        gameTypes.push(circolo.get('gameType1'))
        gameTypes.push(circolo.get('gameType2'))
        gameTypes.push(circolo.get('gameType3'))
        window.localStorage['gameTypes'] = JSON.stringify(gameTypes)*/

      
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

.controller('InvitationCtrl',function($scope, $stateParams, Utility, MyObjects,$state,$ionicModal,$rootScope, $ionicPopup, $ionicLoading) {


  var model = {name:""}
  $scope.model = model
  $scope.invitations = []
  var actualGame = $rootScope.gameTypes[$stateParams.gameType]
  var  numPlayers = parseInt(actualGame.numberPlayers) -1


  $scope.bookingId = $stateParams.bookingId


  $scope.search = function(){


    if ($scope.model.name.length > 2 && $scope.invitations.length < parseInt(numPlayers)){

      $ionicLoading.show({
        template: 'Loading...'
      });
      MyObjects.findPlayersWithName($scope.model.name)
      .then(
        function(results){
          console.log(results);
          $scope.players = results
          $scope.$apply()
          $ionicLoading.hide()

      }, function(error){
        console.log(error);
      })
    }
  }

  $scope.close = function(){
    $state.go("tab.account")
  }

  $scope.invite = function(user){

    model.name = ""
    $scope.players = null
    if ($scope.invitations.length >= parseInt(numPlayers)){
      var alertPopup = $ionicPopup.alert({
         title: 'Opsss!',
         template: 'Scusa! In quanti volete giocare???'
       });
       return
    }

    $ionicLoading.show({
      template: 'Loading...'
    });
    console.log('invitation');
    MyObjects.invite(user.id,user.get('email'),$scope.bookingId)
    .then(
      function(obj){
        console.log('ok');
        return MyObjects.findInvitationAlredySentForBooking($scope.bookingId)
    }, function(error){
      console.log(error);
      throw error
    })
    .then(
      function(obj){
        console.log(obj);
        $scope.invitations = obj

        $ionicLoading.hide()
        //$scope.$apply()
    }, function(error){
      $ionicLoading.hide()
      console.log(error);
      var alertPopup = $ionicPopup.alert({
         title: 'Opsss!',
         template: error.message
       });
    })

  }

})


