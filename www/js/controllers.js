 
angular.module('starter.controllers', ['chart.js','ngCordova']) 

.controller('checkNewVersionCtrl', function($scope, MyObjectsREST, Utility,$ionicModal, $rootScope) {

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

.controller('DashCtrl', function($scope, MyObjectsREST, Utility,$ionicModal, $rootScope) {

  
  
  var edit = {text:"xxxx"}
  $scope.edit = edit 

  MyObjectsREST.getDashboardText()
  .then(
    function(response){
		console.log(response);
		var item = response.results[0];
		console.log(item);
        $scope.text0 = item.area1
        $scope.text1 = item.area2
        $scope.text2 = item.area3
        //$scope.$apply()

        /*

        Parse.Cloud.run('addUsertoRole')
        .then(
          function(response){
            console.log(response)
        }, function(error){
          console.log(error)
        })*/


  }, function(error){
    console.log(error);
  })

     
  
  $ionicModal.fromTemplateUrl('edit.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })


  $scope.closeModal = function() {
    $scope.modal.hide();
    MyObjectsREST.saveDashboardText($scope.index,edit.text)
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

.controller('Login', function($scope, $stateParams, config,$state, $ionicModal,$ionicBackdrop, $timeout, $rootScope,$ionicLoading,$ionicUser, $ionicPush, $log, MyObjectsREST) {

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
	
  if (uname !== undefined && pwd !== undefined) {
          
	  	 MyObjectsREST.login(uname, pwd).success(function(data) {
       
        
			 window.localStorage['token'] = data.token
			 window.localStorage['user'] = JSON.stringify(data.user)
			 window.localStorage['userRole'] = data.user.role
			 $rootScope.currentUser = data.user
			 console.log(data.user)
          
			  /*var gameTypes = []
                gameTypes.push(obj.get('gameType1'))
                gameTypes.push(obj.get('gameType2'))
                gameTypes.push(obj.get('gameType3'))
                window.localStorage['gameTypes'] = JSON.stringify(gameTypes)
                window.localStorage['circolo'] = obj.get('nome')
                
                 */
			MyObjectsREST.createInstallationObject()
			$scope.modal.hide();
          	$ionicLoading.hide();
          	//$state.go('tab.dash');
			console.log('$rootScope.currentUser ')
			console.log($rootScope.currentUser )
          	$state.go('tab.dash');


          

        }).error(function(status) {
          alert('Oops something went wrong!');
        });
      } else {
        alert('Invalid credentials');
     }

  


}

$scope.resetPwd = function(){
  $scope.modal.hide();
  $scope.resetPwdModal.show();
}

$scope.confirmResetPwd = function(){
  console.log($scope.resetPwd.email);
  $ionicLoading.show({
    template: 'Loading...'
  });
  var email = $scope.resetPwd.email
  Parse.User.requestPasswordReset(email, {
      success: function() {
      // Password reset request was sent successfully
      Parse.User.logOut();
      $ionicLoading.hide()
      $scope.messagePwdReset = "Ok! Mail inviata. Leggila e ripristina la tua password. "
      $scope.resetPwdModal.hide()
      },
      error: function(error) {
        // Show the error message somewhere
        $ionicLoading.hide()
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
  window.localStorage['token'] = null
  window.localStorage['user'] = null
  window.localStorage['userRole'] = null
 
  $scope.currentUser = null;
  $state.go('login');
};

})

.controller('SignUp', function($scope, $stateParams, config,$state,$ionicModal, $ionicLoading, $rootScope,$http,vcRecaptchaService,MyObjectsREST) {

//$scope.currentUser = Parse.User.current();
var currentUser = {level:3}
$scope.currentUser = currentUser;
$scope.registered = false;

$scope.privacy = false

$scope.setPrivacy = function(){
  $scope.privacy = ! $scope.privacy 
}

$scope.waiting = "........"
MyObjectsREST.getCircoli()
.then(
  function(obj){
	  console.log(obj)
    $scope.waiting = null
    $scope.circoli = obj.data.circoli
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

  
/*if ($rootScope.platform != 'ios' && $rootScope.platform != 'android' && $scope.captchaResponse == null){
  mymessage.text = "Occorre verificare correttamente il captcha..."
  $ionicLoading.hide();
  return
}*/

  if ( !$scope.privacy || currentUser.email === null || currentUser.email === undefined || currentUser.password === null || currentUser.username === null /*|| currentUser.circolo === undefined*/){
    console.log(currentUser);
    mymessage.text = "Occorre inserire email, username, password, circolo e accettare le condizioni contenute nell'informativa sulla privacy."
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
  MyObjectsREST.signup(currentUser).success(function(data){
	  console.log(data)
	  $ionicLoading.hide();
	  $state.go('waitingToBeEnabled');
  }).error(function(error){
	  $ionicLoading.hide();
      mymessage.text = error;
      console.log(error);
  })

  


};

})

.controller('BookCourt2', function($scope, $stateParams, config,Utility, MyObjectsREST, $ionicModal, $state,$rootScope,$ionicPopup, $ionicPopover,$ionicLoading,$cordovaCalendar,$ionicPopup,$timeout) {
    
    
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
  
  $ionicModal.fromTemplateUrl('courts.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.courtsModal = modal;
  })
  
  $ionicModal.fromTemplateUrl('meteo.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.meteoModal = modal;
  })
  
  
  $scope.getMeteo = function(){
      $scope.meteoModal.show()
  }

  $scope.closeModalok = function() {
    $scope.modalok.hide();
    $state.go('tab.account');
  };
    
  $scope.closeModalCourts = function() {
    $scope.courtsModal.hide();
   
  };
    
 $scope.closeModalMeteo = function() {
    $scope.meteoModal.hide();
   
  };
    
$scope.closeModalok = function() {
    $scope.modalok.hide();
    $state.go('tab.account');
  };

    

  $scope.$on('$destroy', function() {
    $scope.modalok.remove();
  });

//***************************FINE SEZIONE MODAL*****************************************************

 $scope.weekDays = Utility.getWeekdayFromToday()
 $scope.selectedDate = $scope.weekDays[0].value
 //console.log($scope.selectedDate)
 
 $scope.hours = Utility.getHours()
 $scope.selectedRange = 25
 
 $scope.dateCallback = function(item){
     console.log(item) 
     $scope.selectedDate=item
     $scope.coachAvalabilities = []
     avalaibleRanges = [];
     selectedRanges = [];
     $scope.showRanges = false
     $scope.toggleCoach.value = false
     $scope.avalaivableCourts = []
     $scope.message = null
     //booking.datex = item.toDate()
     booking.date = item.toDate()
     
     console.log(booking)
     
 }
  $scope.timeCallback = function(item){
     console.log(item)
     $scope.selectedRange = item
     $scope.coachAvalabilities = []
     avalaibleRanges = [];
     selectedRanges = [];
     $scope.showRanges = false
     $scope.toggleCoach.value = false
     $scope.avalaivableCourts = []
     $scope.message = null
     
 }
 
   $scope.toggleCall = function(){
    
    if (booking.callToAction){
        booking.playersNumber = 3
        $ionicPopup.alert({
             template: "Seleziona il numero di giocatori che possono prendere parte alla tua Call. Ad esempio se sai già che giocherai tu ed un amico allora seleziona il valore 2. "
        });
    }
    
    

}

  var toggleCoach = {value:false}
  $scope.toggleCoach = toggleCoach


  $scope.coachAvalabilities = []
  var avalaibleRanges = [];
  var selectedRanges = [];

  
  var booking = {};
  booking.gameType = $rootScope.currentGameType.value;
  booking.callToAction = false;
  booking.date = $scope.selectedDate.toDate();
  booking.duration = 3
  $scope.booking = booking;
    
  //console.log(booking)

  $scope.getDuration = function(){
    //console.log($scope.booking.duration)
    return $scope.booking.duration
  }

  $scope.setDuration = function(index){
    $scope.booking.duration = index
  }
  
  
  $scope.getAvalaivableCourts = function(){
      $scope.waiting = "....."
      $scope.courtsModal.show()
      var ranges = getRanges()
      var date = booking.date
      
      
      MyObjectsREST.checkBeforeCreateBooking(date,ranges , booking.gameType)
    .then(
      function(obj){
          $scope.waiting = null

        $scope.avalaivableCourts = obj
        //$scope.$apply()
        

    }, function(error){
      $scope.waiting = null
      console.log(error);
      $scope.courtsModal.hide()
      //$scope.message = "Nessun campo disponibile nelle fascie orarie selezionate..."
      $ionicPopup.alert({
        title: 'Oops!',
        template: 'Nessun campo disponibile nelle fascie orarie selezionate...Ecco gli orari disponibili.'
       });
      $scope.showRanges = true
       MyObjectsREST.findaAvalaibleRangesInDate(booking.date, booking.gameType)
      .then(
        function(ranges){
          avalaibleRanges = ranges;
          console.log(ranges)
          $scope.waiting = null
          $scope.$apply()

      }, function(error){
        $scope.waiting = null
        console.log(error);
      })

    })
  }
  

 

  $scope.gotoInvitation = function(){
    
    $scope.modalok.hide();
    console.log ('invitation....')
    $state.go('invitation',{'bookingId':$scope.booking.id,'gameType':$scope.booking.get('gameType')})
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
    $scope.message = null /*nascondo il messaggio*/
    $scope.avalaivableCourts=null;
    

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


    $scope.selectedHours = Utility.getHoursFromRanges(selectedRanges);

  }


  $scope.toggleCoach = function(){

    $scope.showRanges = false
    $scope.waiting = "........"

    if ($scope.toggleCoach.value == true){
      $scope.coachesModal.show();
      MyObjectsREST.getCoaches().then(function(results){
        $scope.coaches = results
        $scope.waiting = null
        
        $scope.$apply()
        
      },function(error){
        console.log(error);
      })

    }

    else {
      booking.maestro = null
      $scope.coachAvalabilities = []
      avalaibleRanges = []
      $scope.waiting = null
      $scope.message = null
    }
  }


  $scope.selectCoach = function(coach){

    console.log(coach);
    booking.maestro = coach
    $scope.coachesModal.hide();
    $scope.showRanges = true
  
    var date = booking.date
    MyObjectsREST.getCoachAvalabilitiesFilteredByBookings(date.getMonth(),date.getFullYear(),coach.id, booking.gameType )
    .then(
      function(results){
        $scope.coachAvalabilities = results
        console.log(results)
        
        // Formato coachAvalabilities ==> [{day:d.get('date').getDate(),range:r}]
        var x = _.filter($scope.coachAvalabilities, function(item){
          if (item.day == date.getDate() ){
            return item
          }
        })
        avalaibleRanges = _.pluck(x,'range')
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




  var getRanges = function(){
      if (selectedRanges.length == 0){
        var startSlot =  $scope.selectedRange
        var endSlot = startSlot + $scope.booking.duration
        return _.range(startSlot, endSlot );
        
        
      }
      else
          return selectedRanges
          
  }

   
   
  $scope.book = function(){
  
    
    if ($scope.showRanges && selectedRanges.length == 0){
      //$scope.message = "Occorre selezionare almeno una fascia oraria."
        $ionicPopup.alert({
           title: 'Oops!',
           template: 'Occorre selezionare almeno una fascia oraria.'
        });
      return;
    }

    
    $rootScope.openLoading()
    $scope.waiting = "......."
   
    booking.ranges = getRanges();

    //console.log(booking);

    MyObjectsREST.createBooking(booking)
    .then(
      function(response){
          
      $scope.waiting = null
      console.log(response.results)
	 

      $scope.message = "Prenotazione Effettuata!";
       
	  $scope.booking = booking
      
      $scope.modalok.show();
      $rootScope.closeLoading()
     

    }, function(error){

      $scope.waiting = null
      console.log(error);
      $scope.showRanges = true
      booking.court = null
      //$scope.message = "Oooops! Nessun campo disponibile nelle fasce orarie selezionate..."
      $ionicPopup.alert({
           title: 'Oops!',
           template: 'Nessun campo disponibile nelle fasce orarie selezionate...'
        });
      MyObjectsREST.findaAvalaibleRangesInDate(booking.date, booking.gameType)
      .then(
        function(ranges){
          avalaibleRanges = ranges;
          //console.log(ranges)
          $scope.waiting = null
          $scope.$apply()

      }, function(error){
          $scope.waiting = null
          console.log(error);
      })

    })
    selectedRanges = [];

  }

  $scope.addEventToCalendar = function(){

      var startSlot = $scope.booking.get('ranges')[0]
      var endSlot = $scope.booking.get('ranges')[$scope.booking.get('ranges').length - 1]

      var startHM = Utility.getHourMinuteFromSlot(startSlot)
      var endHM = Utility.getHourMinuteFromSlot(endSlot)
    
      var sdate = $scope.booking.get('date')
      sdate.setHours(startHM[0])
      sdate.setMinutes(startHM[1])
    
     var edate = new Date(sdate.valueOf())
     edate.setHours(endHM[0])
     edate.setMinutes(endHM[1] + 30)

    $cordovaCalendar.createEvent({
          title: 'Partita',
          notes: 'Tennis-Paddle',
          startDate : sdate,
          endDate : edate
        }).then(function (result) {
          var alertPopup = $ionicPopup.alert({
           title: 'ok!',
           template: 'Evento creato con successo nel tuo calendario!'
          });
          
        }, function (err) {
          var alertPopup = $ionicPopup.alert({
           title: 'oops!',
           template: 'La prenotazione è andata a buon fine ma non sono riuscito ad aggiornare il tuo calendario! Cambiare telefono????'
          });
        });
}

    
 

})

.controller('callToAction', function($scope, MyObjectsREST,$ionicModal, config,$ionicPopup,$rootScope) {

  $ionicModal.fromTemplateUrl('ok-modal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.mayIJoin = function(cta){
    return _.inRange($rootScope.currentUser.level, cta.user.level - 1, parseInt(config.playersLevels) + 1) ;
  }


  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //Invece del loading....
  $scope.waiting = "......"
   MyObjectsREST.findCallToAction()
  .then(
    function(response){
      console.log(response.results)
      $scope.waiting = null
      $scope.callToActionOpen = response.results
      $scope.$apply()
  }, function(error){
    console.log(error);
  })


  $scope.add = function(cta){

    $scope.waiting = "......"
     MyObjectsREST.addCallToActionPlayer(cta)
    .then(
      function(obj){
        $scope.waiting = null
         MyObjectsREST.findCallToAction()
        .then(
          function(results){
            $scope.callToActionOpen = results
            $scope.$apply()
        }, function(error){
          $scope.waiting = null
          console.log(error);
        })

    }, function(error){
      $scope.waiting = null
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

.controller('AccountCtrl', function($scope, $state,$ionicModal,$rootScope,$ionicPopup,$ionicListDelegate,$timeout,$ionicLoading,$http,$cordovaCamera,Utility,MyObjectsREST) {
    
    // Il ruolo admin o segreteria non vede la pagina account (inutile...)
    if ($rootScope.currentUser.role == 'admin' || $rootScope.currentUser.role == 'segreteria')
      $state.go("statistics") 

    var currentLevel = {value: $rootScope.currentUser.level}
    $scope.currentLevel = currentLevel
    
   

    $ionicModal.fromTemplateUrl('prossimiImpegni.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.prossimiImpegniModal = modal;
    })
    $ionicModal.fromTemplateUrl('inviti.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.invitiModal = modal;
    })
    $ionicModal.fromTemplateUrl('saldare.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.saldareModal = modal;
    })
    $ionicModal.fromTemplateUrl('camera.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.cameraModal = modal;
    })
     $ionicModal.fromTemplateUrl('status.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.statusModal = modal;
    })
     $ionicModal.fromTemplateUrl('message.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.messageModal = modal;
  })
   $ionicModal.fromTemplateUrl('callToActionDetail.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.callToActionDetailModal = modal;
  })
  
     
     $scope.openCallToActionDetailModal = function(booking){
        
        $scope.selectedBooking = null
        $scope.message = null
        console.log('calltoaction')
        booking.playersNumberMissing = 3
        $scope.selectedBooking = booking
        $scope.callToActionDetailModal.show()
        
    } 
     
     
      $scope.closeCallToActionDetailModal = function(){
        
        $scope.callToActionDetailModal.hide()
    }
  
    $scope.confirmCallToAction = function(){
        console.log($scope.selectedBooking)
        MyObjectsREST.setCallToAction($scope.selectedBooking)
        $scope.message = "Fatto!"
        $scope.callToActionDetailModal.hide()
    
    }

    $scope.openCameraModal = function(){
        
        $scope.cameraModal.show()
    }
    
    $scope.closeCameraModal = function(){
        $scope.cameraModal.hide()
    }
    $scope.openStatusModal = function(){
        $scope.status = {value: Parse.User.current().get('status')}
        $scope.statusModal.show()
    }
    
    $scope.closeStatusModal = function(){
        $scope.statusModal.hide()
    }
    
    $scope.closeMessageModal = function() {
        $scope.message = null
        //$scope.$apply()
        $scope.messageModal.hide();
        //$state.go('tab.account');
    };
    
    $scope.gotoMessage = function(booking){
     $scope.bookingMessage = booking
     $scope.messageToSend = {value:""}
     $scope.messageModal.show()
    }
    //*********************************************
  var vm = $scope;
  var imageData;
 
  // Object to save to Parse that includes an image
  var object = {
    text: "",
    image: null
  };
 
  // Function to take a picture using the device camera
  vm.takePicture = function() {
 
    // Define various properties for getting an image using the camera
    var cameraOptions = {
      quality : 75,
      // This ensures the actual base64 data is returned, and not the file URI
      destinationType: Camera.DestinationType.DATA_URL,
      encodingType : Camera.EncodingType.JPEG,
      targetWidth: 300,
      targetHeight: 300
    };
 
    // Use the Cordova Camera APIs to get a picture. For brevity, camera
    // is simply an injected service
    $cordovaCamera.getPicture(cameraOptions).then(function(returnedImageData) {
    imageData = returnedImageData;
    submitObject(imageData)
    $scope.cameraModal.hide()
        
 
    }, function(err) {
      console.log("Error taking picture: " + err);
    });
  };
 
  // Function to submit the object using the REST API
  function submitObject(imageData) {
 
    //TODO
  };
 

    //*********************************************
    
    $scope.openProssimiImpegniModal = function(){

      $scope.prossimiImpegniModal.show()
      $scope.waitingMyBookings = "....."
      $rootScope.openLoading()
       MyObjectsREST.findMyBookings()
        .then(
          function(results){
            $rootScope.closeLoading()
			console.log(results)
            $scope.bookings = results
            $scope.waitingMyBookings = null
            //$scope.$apply()
        }, function(error){
              console.log(error);
              $scope.error = "ooooops.....errore di connessione"
              //$scope.waiting = null
              
        })
    }
    $scope.closeProssimiImpegniModal = function(){
      $scope.prossimiImpegniModal.hide()
    }
    $scope.openInvitiModal = function(){
      $scope.invitiModal.show()
      $scope.waitingMyInvitations = "....."
      $rootScope.openLoading()
      MyObjectsREST.findMyInvitations()
        .then(
          function(response){
            $scope.invitations = response.results
            $rootScope.closeLoading()
            $scope.waitingMyInvitations = null
            $scope.$apply()
        }, function(error){
          console.log(error);
          $scope.error = "ooooops.....errore di connessione"
          //$scope.waiting = null
          
        })
    }
    $scope.closeInvitiModal = function(){
      $scope.invitiModal.hide()
    }
    $scope.openSaldareModal = function(){
      $scope.saldareModal.show()
      $scope.waitingMyGameNotPayed = "....."
      $rootScope.openLoading()
      MyObjectsREST.findMyGameNotPayed()
        .then(
          function(results){
            $scope.waitingMyGameNotPayed = null
            $rootScope.closeLoading()
            $scope.gameNotPayed = results
            //$scope.$apply()
        }, function(error){
          console.log(error);
          $scope.error = "ooooops.....errore di connessione"
          //$scope.waiting = null
          
        })
    }

    $scope.closeSaldareModal = function(){
      $scope.saldareModal.hide()
    }
   
    var init = function(){
        $scope.error = null
        
    }

    //***************************************
    init()
    //***************************************
    
  $scope.accept = function(invitation){
    $scope.waitingMyInvitations = "......"
    MyObjectsREST.acceptInvitation(invitation)
    .then(
      function(obj){
        MyObjectsREST.deleteParseObjectFromCollection(invitation,$scope.invitations)
        $scope.waitingMyInvitations = null
        //$scope.$apply()
        
    }, function(error){
        $scope.waitingMyInvitations = null
        $ionicPopup.alert({
         title: 'Opsss!',
         template: error
       });
        console.log(error);
        
    })
    
  }

  $scope.decline = function(invitation){
    $scope.waitingMyInvitations = "......"
    MyObjectsREST.declineInvitation(invitation)
    .then(
      function(obj){
        MyObjectsREST.deleteParseObjectFromCollection(invitation,$scope.invitations)
        $scope.waitingMyInvitations = null
        $scope.$apply()
        
    }, function(error){
      console.log(error);
      $scope.waitingMyInvitations = null
      
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
  
  $scope.infoProssimiImpegni = function(){
            $ionicPopup.alert({
               title: 'Info',
               template: "Le icone hanno, nell'ordine, il seguente significato: cancella, invita, trasforma in una Call To Action, invia un messaggio ai giocatori della partita." 
             });
          }

  
  $scope.delete = function(item){

   $scope.waitingMyBookings = "......"
   $rootScope.openLoading()
     MyObjectsREST.deleteBooking(item)
    .then(function(){
       MyObjectsREST.deleteParseObjectFromCollection(item,$scope.bookings)
      $scope.waitingMyBookings = null
      $rootScope.closeLoading()
      $scope.$apply()
    })
  }
  $scope.invitation = function(booking){
    console.log('gotoInvitation')
     $scope.prossimiImpegniModal.hide()
     $state.go('invitation',{'bookingId':booking.id,'gameType':booking.get('gameType')})
  }
  

  $scope.payMyBooking = function(booking){
    //Pago la mia quota ma non posso mettere payed a true perchè è possibile che altri debbano pagare.
   $scope.waitingMyGameNotPayed = "......"
     MyObjectsREST.payMyBooking(booking).then(function(ret){
      $ionicListDelegate.closeOptionButtons()
      $scope.waitingMyGameNotPayed = null
      console.log('payed....')

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

  $scope.changeMyLevel=function(){
    $state.go('changeLevel')
  }
  
  $scope.setStatus = function(){
      
       MyObjectsREST.setStatus($scope.status.value)
      $scope.statusModal.hide()
  }
  
  $scope.sendMessage=function(){
      
       MyObjectsREST.sendMessageBookingUsers($scope.bookingMessage,$scope.messageToSend.value)
      $scope.messageModal.hide()
      $scope.message = "Messaggio inviato!"
      
  }

})


.controller('gameTypeController',function($scope,$state,$rootScope){
    
    

    $scope.close = function(){
      $state.go('tab.dash')

    }
})

.controller('changeLevelCtrl',function($scope,$state,$rootScope){
    var currentLevel = {value: $rootScope.currentUser.get('level')}
    $scope.currentLevel = currentLevel

    $scope.confirmChangeLevel = function(){
      //Utilizzato invece del ionicLoading per far vedere lo spinner in pagina...
      $scope.waiting = "..."
      var currentUser = Parse.User.current();
      currentUser.set('level' , parseInt($scope.currentLevel.value));
      currentUser.save()
      .then(
        function(obj){
          //console.log(obj);

          $state.go('tab.account')

      }, function(error){
        console.log(error);
      })

    }
})

.controller('resetPwdCtrl',function($scope,$state,$rootScope){
    $scope.confirmResetPwd = function(){
      window.localStorage.removeItem('token')
	  window.localStorage.removeItem('user')
	  window.localStorage.removeItem('userRole')

	  $scope.currentUser = null;
	  $state.go('login');
    }
      

    
})

  
.controller('manageUsers', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility,$state,$rootScope){

  if($rootScope.userRole == null)
    $state.go('tab.dash')    

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

    $ionicModal.fromTemplateUrl('changeLevel.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose:false
    }).then(function(modal) {
      $scope.changeLevelModal = modal;

    })

    $scope.changeLevelOpen = function(user){
         $scope.userx = user
          $scope.userx.level = user.get('level')
          $scope.changeLevelModal.show()
    }

    $scope.changeLevelClose = function(user){
      $scope.changeLevelModal.hide()
    }

    $scope.confirmChangeLevel = function(user){
      user.set('level',user.level)
       MyObjectsREST.changeUserLevel(user)
      .then(
        function(obj){
          //console.log(obj);
          $scope.changeLevelModal.hide()
          //$state.go('tab.account')

      }, function(error){
        console.log(error);
      })

    }


    $scope.findUsers = function(){
        $scope.message = ""
        $ionicLoading.show({
          template: 'Loading...'
        });
         MyObjectsREST.findPlayersWithName($scope.userToSearch.nome)
        .then(function(ret){
          $ionicLoading.hide()
          $scope.myresults = ret
          if (ret.length == 0)
            $scope.message = "Nessun utente trovato..."
        },function(error){
          $ionicLoading.hide()
        })

    }

  
    $scope.getRecharges = function(user){
          
          $scope.waiting = "....."
          $scope.user = user
           MyObjectsREST.getRecharges(user)
        .then(function(results){
          $scope.recharges = results
          $scope.waiting = null
          $scope.rechargeModal.show()
        })
      }

    $scope.getPayments = function(user){
          $scope.waiting = "....."
          $scope.user = user
           MyObjectsREST.getPayments(user)
        .then(function(results){
          $scope.payments = results
          $scope.waiting = null
          $scope.paymentsModal.show()
        })
      }

      $scope.closePaymentModal = function(){
        $scope.paymentsModal.hide()
      }

      $scope.closeRechargeModal = function(user){
        //$scope.rechargeModal.hide()
          $ionicLoading.show({
            template: 'Loading...'
          });
           MyObjectsREST.findPlayersWithName($scope.userToSearch.nome)
          .then(function(ret){
            $ionicLoading.hide()
            $scope.rechargeModal.hide()
            $scope.myresults = ret
            if (ret.length == 0)
              $scope.message = "Nessun utente trovato..."
          })
          
      }

      $scope.addCharge = function(){
         MyObjectsREST.addCharge($scope.user,$scope.recharge.qty)
        .then(function(ret){
           return  MyObjectsREST.getRecharges($scope.user)
          })
          .then(function(results){
            $scope.recharges = results
        })
      }

      $scope.enabling = function(user){

        //console.log(user);
        $ionicLoading.show({
            template: 'Loading...'
          });
         MyObjectsREST.enabling(user)
        .then(function(ret){
           MyObjectsREST.findPlayersWithName($scope.userToSearch.nome)
        .then(function(ret){
          $ionicLoading.hide()
          $scope.myresults = ret
          $scope.$apply()
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
       MyObjectsREST.getUsersToEnable()
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


.controller('statsController', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility,$state,$stateParams,$rootScope){

    if($rootScope.userRole != 'admin')
      $state.go('tab.dash')    

    $scope.waiting = "........"

    var month = $stateParams.month
    var year = $stateParams.year

    $scope.month = parseInt(month)+1
    $scope.year = year

     MyObjectsREST.statsByBookingAndMonth(month,year)
    .then(function(results){
      //$scope.waiting = null
      $scope.statsByBookingAndMonth = results
      
    })

     MyObjectsREST.statsByPaymentsAndMonth(month,year,'quota')
    .then(function(results){
      //$scope.waiting = null
      $scope.statsByPaymentsAndMonth_quote = results
      
    })

     MyObjectsREST.statsByPaymentsAndMonth(month,year,'tessera')
    .then(function(results){
      //$scope.waiting = null
      $scope.statsByPaymentsAndMonth_tessere = results
      
    })

     MyObjectsREST.statsByUser().then(
        function(obj){
          
          $scope.stats_usersNumber = obj 

    
      }, function(error){
        console.log(error);
      })


     MyObjectsREST.statsByBookingAndYear(year).then(
        function(obj){
    
          //$scope.statsBookingYear = obj 

          console.log(obj)
          
          $scope.labels1 = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug','Ago', 'Sett', 'Ott', 'Nov', 'Dic'];
          $scope.series1 = ['Prenotazioni'];


          var data1 = []
          data1.push(obj)
          
          $scope.data1 = data1
          
          //$scope.$apply()
    
      }, function(error){
        console.log(error);
      })

     MyObjectsREST.statsByPaymentAndYear(year).then(
        function(obj){
          var quote = _.take(obj,12)
          var tariffe = _.takeRight(obj,12)
          
          
          $scope.labels2 = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug','Ago', 'Sett', 'Ott', 'Nov', 'Dic'];
          $scope.series2 = ['Quote','Tessere'];
          
          var data = []
          data.push (quote)
          data.push (tariffe)
          
          
          $scope.data2 = data
          //Questa è l'operazione più lunga...
          $scope.waiting = null
          //$scope.$apply()
    
      }, function(error){
        console.log(error);
      })
  

   
  $scope.goBack = function() {
    $state.go('statistics')
  };

})
    

.controller('statistics', function($scope, MyObjects,$ionicModal,$ionicLoading, Utility,$state,$rootScope){

  if($rootScope.userRole == null)
    $state.go('tab.dash')    

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

 $ionicModal.fromTemplateUrl('saldare.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.saldareModal = modal;
    })

    $scope.openSaldareModal = function(){
      $scope.saldareModal.show()
      $scope.waiting = "....."
       MyObjectsREST.findBookingsToPayBeforeDate(today)
      .then(
        function(results){
           $scope.waiting = null
          $scope.results = results
          $scope.$apply()

      }, function(error){
        console.log(error);
        $scope.error = "ooooops.....errore di connessione"
      })

    }

    $scope.closeSaldareModal = function(){
      $scope.saldareModal.hide()
    }

  $scope.$on('currentDateChanged', function(event, x) {
      console.log('on currentDateChanged.....')
      var m = x.split(":")[0]
      var y = x.split(":")[1]
      $scope.currentMonth = m
      $scope.currentYear = y

      $scope.selectedDay = null;

  });

  /*$scope.pay = function(booking){

     MyObjectsREST.payBooking(booking)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })

  };*/

    $scope.setBookingPayed = function(booking){

     MyObjectsREST.setBookingPayed(booking)
    .then(
      function(obj){
        console.log('ok');
    }, function(error){
      console.log(error);
    })

  };


  $scope.delete = function(item){

    console.log('delete');
     $scope.waiting = "......"
    
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + $scope.selectedDay

     MyObjectsREST.deleteBooking(item)
    .then(function(item){
      return  MyObjectsREST.findBookingsToPayBeforeDate(new Date(datex))
    })
    .then(
      function(results){
        $scope.results = results
         $scope.waiting = null
        //$scope.$apply()
    }, function(error){
       $scope.waiting = null
        console.log(error);
    })

  }

  $scope.dayClicked = function(day){

    $scope.selectedDay =  day;
    /*console.log('dayClicked' + day);
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + day
    $scope.date = Utility.formatDate(new Date(datex))

     MyObjectsREST.findBookingsToPayBeforeDate(new Date(datex))
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

  /*$scope.gotoCourtsView = function(){


    if ($scope.selectedDay == null){
      var today = new Date();
      $scope.selectedDay = today.getDate()
    }
    
    var m = parseInt($scope.currentMonth) + 1
    var datex = $scope.currentYear + "/" + m + "/" + $scope.selectedDay
    //console.log(datex)

    $state.go('courtsView',{'datez': datex, "gameType":$scope.gameType});

  }*/

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

  $scope.gotoStats = function(){
    $state.go('stats',{'month':$scope.currentMonth,'year':$scope.currentYear})
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

    //console.log(booking)
    //*********************************Variabile usate per memorizzare la prenotazione selezionata********
    $scope.waiting = "......."
    $scope.bookingx = booking
    $scope.bookingx.note = booking.get('note')
     MyObjectsREST.getPaymentsByBooking(booking).then(
        function(results){
           $scope.waiting = null
           $scope.payments = results
           $scope.modal.show();
    
      }, function(error){
        $scope.waiting = null
        console.log(error);
      })
    
    //$state.go('tab.account');
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
    // MyObjectsREST.saveDashboardText($scope.index,edit.text)
  };

  $scope.openAddPaymentTesseraModal = function(booking) {
    //console.log(booking)
    //$scope.paymentTessera = {"qty":1}
    $scope.addPaymentModal.show();
    //$state.go('tab.account');
  };

  $scope.closeAddPaymentTesseraModal = function() { 
     MyObjectsREST.getPaymentsByBooking($scope.bookingx).then(
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
    $scope.waiting = "......"

     MyObjectsREST.findPlayersWithName($scope.searchUser.name)
      .then(
        function(results){
          $scope.waiting = null
          $scope.usersForAddingPayment = results
          if (results.length == 0)
            $scope.messageModalTessera = "Nessun utente trovato"
          $scope.$apply()
          
      }, function(error){
        console.log(error);
        $scope.waiting = null
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

  var init = function(){
    $scope.waiting = "...."
    var d = new Date( datex)

     MyObjectsREST.courtsView(d, gameType)
    .then(function(results){
      $scope.waiting = null
      $scope.myresults = results
      $scope.$apply() 
    })

  }

  
   init()

  

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

  $scope.payQuota = function(booking){
        
        $scope.waiting = "......"
         MyObjectsREST.payQuota(booking).then(
            function(quota){
              $scope.waiting = null
              $scope.payments.push(quota) 
              $scope.$apply()
        
          }, function(error){
            $scope.waiting = null
            console.log(error);
          })
      
    }

    $scope.payTessera = function(booking){
      $scope.waiting = "......"
       MyObjectsREST.payTessera(Parse.User.current(),booking,1)
          .then(function(tessera){
            $scope.waiting = null
            $scope.payments.push(tessera) 
            $scope.$apply()
            //$scope.$apply()
          }, function(error){
                  console.log(error)
                  $scope.waiting = null
          })
    }

/* KKK scommentare quando verrà abilitato pagamento tessere
  $scope.payTessera = function(user){
    try{
        $ionicLoading.show({
          template: 'Loading...'
        });
         MyObjectsREST.payTessera(user,$scope.bookingx,1)
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

  }}*/

  $scope.saveNote = function(booking){
    console.log('saveNote...' + booking.note)
     MyObjectsREST.saveNote(booking)
    // MyObjectsREST.findBookings(2,2015)
  }


  $scope.setBookingPayed = function(booking){
     MyObjectsREST.setBookingPayed(booking)
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
    
     MyObjectsREST.deleteBooking(mybooking)
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
     MyObjectsREST.createBooking(mybooking)
    .then(
      function(result){
      //console.log('state.go....') 
      //$state.go('tab.courtsView',{'datez': datex});
      // MyObjectsREST.courtsView(new Date( datex))
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
    $scope.waiting = "....."
     MyObjectsREST.deletePayment(payment)
    .then(
      function(obj){
        return  MyObjectsREST.getPaymentsByBooking($scope.bookingx)
      }, function(error){
        console.log(error);
      })
    .then(
      function(results){
        $scope.waiting = null
         $scope.payments = results
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
       MyObjectsREST.courtsView(new Date( datex), gameType)
      .then(function(results){

        $scope.myresults = results
        $ionicLoading.hide()
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

       MyObjectsREST.getDisponibilitaCoachForCalendar(m,y, maestro.id).then(
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

     MyObjectsREST.deleteDisponibilitaCoach(date)
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

       MyObjectsREST.addDisponibilitaCoach({date: new Date(d), ranges:selectedRanges}).then(
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

.controller('UserToEnable', function($scope, $stateParams, Utility, MyObjects,$state,$ionicLoading,$ionicPopup,$ionicModal,$rootScope) {

   if($rootScope.userRole == null)
    $state.go('tab.dash')  

  $ionicModal.fromTemplateUrl('userDetail.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $ionicLoading.show({
    template: 'Loading...'
  });
   MyObjectsREST.getUsersToEnable()
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

  $scope.userDetailOpen = function(user){

    $scope.userx = user
    $scope.userx.level = user.get('level')
    $scope.modal.show()
  }

  $scope.userDetailClose = function(){
    $scope.modal.hide()
  }

  $scope.enableUser = function(user){
    console.log(user);
     MyObjectsREST.enableUser(user)
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


  $scope.confirmChangeLevel = function(user){
      user.set('level',user.level)
       MyObjectsREST.changeUserLevel(user)
      .then(
        function(obj){
          console.log(obj);
          $scope.modal.hide()
          //$state.go('tab.account')

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

.controller('InvitationCtrl',function($scope, $stateParams, Utility, MyObjects,$state,$ionicModal,$rootScope, $ionicPopup, $ionicLoading, $timeout) {


  var model = {name:""}
  $scope.model = model
  $scope.invitations = []
  var actualGame = $rootScope.gameTypes[$stateParams.gameType]
  var  numPlayers = parseInt(actualGame.numberPlayers) -1
  
  
  

  $scope.bookingId = $stateParams.bookingId
  
  $ionicModal.fromTemplateUrl('cerca.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.cercaModal = modal;
    })
    $ionicModal.fromTemplateUrl('preferiti.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.preferitiModal = modal;
    })
     $ionicModal.fromTemplateUrl('playersByLevel.html', {
    scope: $scope,
    animation: 'slide-in-up',
    backdropClickToClose:false
    }).then(function(modal) {
      $scope.playersByLevelModal = modal;
    })
    
    $scope.openCercaModal = function(){
        $scope.cercaModal.show()
    }
    
    $scope.openPreferitiModal = function(){

        $scope.waiting = "....."
        
        $rootScope.openLoading()
       
        $scope.preferitiModal.show()
         MyObjectsREST.getPreferred().then(function(results){
            //console.log(results)
            $rootScope.closeLoading()
            $scope.preferences = results
            $scope.waiting = null
            $scope.$apply()
        })

    }
    
     $scope.openPlayersByLevelModal = function(){
        $rootScope.openLoading()
        $scope.playersByLevelModal.show()
        $scope.waiting = "....."
         MyObjectsREST.getPlayersByLevel().then(function(results){
            
            $rootScope.closeLoading()
            $scope.playersByLevel = results
            $scope.waiting = null
            $scope.$apply()
        })
        
    }
    
    $scope.closeCercaModal = function(){
        $scope.cercaModal.hide()
    }
    
    $scope.closePreferitiModal = function(){
        $scope.preferitiModal.hide()
    }
    
    $scope.closePlayersByLevelModal = function(){
        $scope.playersByLevelModal.hide()
    }
    
    
    //*******INIT*******************
     MyObjectsREST.findInvitationAlredySentForBooking($scope.bookingId).then(
    function(results){
        $scope.waiting = null
        $scope.invitations = results
    })
    //******************************


  $scope.search = function(){


    if ($scope.model.name.length > 2 && $scope.invitations.length < parseInt(numPlayers)){

      $scope.waiting = "........"
      $scope.preferences = []
      $rootScope.openLoading()
       MyObjectsREST.findPlayersWithName($scope.model.name)
      .then(
        function(results){
          //console.log(results);
          $scope.waiting = null
          $rootScope.closeLoading()
          $scope.players = results
          $scope.$apply()
          

      }, function(error){
        console.log(error);
      }, function(progress){
        $scope.waiting = "........"
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
      $ionicPopup.alert({
         title: 'Opsss!',
         template: 'Scusa! In quanti volete giocare??? La Call è già al completo!'
       });
       return
    }
    //Asincrono per efficienza....
     MyObjectsREST.invite(user.id,user.get('email'),$scope.bookingId)
    $scope.message = "Utente invitato!"
    $timeout(function() {
       $scope.message = null
    }, 2000);
     MyObjectsREST.findInvitationAlredySentForBooking($scope.bookingId)
    .then(function(obj){
        console.log(obj);
        $scope.invitations = obj
    })
}
})

