// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic','ionic.service.core','ionic.service.push','ngCordova','ionic.service.deploy', 'ngIOS9UIWebViewPatch', 'starter.controllers',  'starter.servicesREST','starter.directives','starter.filters','vcRecaptcha'])

.run(function($ionicPlatform,$rootScope, $state,$cordovaSplashscreen,$timeout,$ionicLoading,MyObjectsREST,Utility,$ionicPush) {


  $ionicPlatform.ready(function() {
    
	$rootScope.platform = ionic.Platform.platform()
    //Scommentare per APP
    //MyObjectsREST.createInstallationObject()
	
	
    //**************************************
     console.log("$ionicPlatform.ready...")
    //**************************************
    
    $rootScope.closeLoading = function(){
        $ionicLoading.hide()   
    }
    $rootScope.openLoading = function(){
        $ionicLoading.show({ template: '<img src="img/logo.png" width=50 height=50>', scope:$rootScope, duration:4000 });   
    }
    


    if ($rootScope.platform == 'ios' || $rootScope.platform == 'android' ){
      $timeout(function() {
            $cordovaSplashscreen.hide()
        }, 100)
    }
      
      
  


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

  });

     
    $rootScope.$on('$stateChangeStart', function (event, next) {
        //var currentUser = Parse.User.current();
		var currentUser 
		if (window.localStorage['user'])
		 	currentUser = JSON.parse(window.localStorage['user'])

        if(next.name =='login' || next.name== 'signUp' || next.name == 'waitingToBeEnabled' || next.name == 'privacy' || next.name == 'resetPwd') {

           console.log('verso login...');

         }
		else if (currentUser) {

            $rootScope.currentUser = currentUser;
			      $rootScope.userRole = currentUser.role

            if ($rootScope.gameTypes == null){
                var circolo = JSON.parse(window.localStorage['user']).circolo
                var gameTypes = []
                gameTypes.push(circolo.gameType1)
                gameTypes.push(circolo.gameType2)
                gameTypes.push(circolo.gameType3)
                $rootScope.gameTypes = gameTypes
            }
            if ($rootScope.currentGameType == null){
                var currentGameType = {value:0}
                $rootScope.currentGameType = currentGameType
            }
           
			if (MyObjectsREST.getNotifications() && MyObjectsREST.getNotifications().length > 0)
				$rootScope.notificationCount = MyObjectsREST.getNotifications().length 
  
        } else {
            // show the signup or login page
            console.log('currentUser is null.!!');
            $state.go('login');
            event.preventDefault();

        }
        return;

    });
	
	
	  //**************************************SCOMMENTARE per APP**********************
    //if ($rootScope.currentUser)
    //    MyObjects.createInstallationObject()
    //******************************************************************************* 
    
 

})

.constant('config', {

  slotsNumber: 48,
  playersLevels:6,
  //serverAddress: 'http://178.62.243.221:3000/',
  //webServerAddress: 'http://178.62.243.221:8081/'
  serverAddress: 'http://localhost:3000/',
  webServerAddress: 'http://localhost:8080/'

})

.config(function($stateProvider, $urlRouterProvider,$httpProvider) {

  $httpProvider.interceptors.push('TokenInterceptor');

  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  
  .state('resetPwd', {
		url: '/resetPwd/:user/:token',
		cache: true,
		templateUrl: 'templates/resetPwd.html',
	  controller: 'resetPwdCtrl'

	  })
  
  .state('errorPage', {
		url: '/errorPage',
		cache: true,
		templateUrl: 'templates/errorPage.html'

	  })

  .state('login', {
    url: '/login',
    cache: false,
    templateUrl: 'templates/login.html',
    controller: 'Login'

  })

  .state('signUp', {
  url: '/signUp',
  cache: false,
  templateUrl: 'templates/signup.html',
  controller: 'SignUp'

})


  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'

  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })


  .state('tab.bookCourt2', {
      url: '/bookCourt2',
      cache: false,
      views: {
        'tab-bookCourt': {
          templateUrl: 'templates/bookCourt2.html',
          controller: 'BookCourt2'
        }
      }
    })
  
.state('tab.setAvalability', {
      url: '/setAvalability',
      views: {
        'tab-setAvalability': {
          templateUrl: 'templates/setAvalability.html',
          controller: 'SetAvalability'
        }
      }
    })

  
  .state('tab.callToAction', {
      url: '/callToAction',
      cache: false,
      views: {
        'tab-callToAction': {
          templateUrl: 'templates/callToAction.html',
          controller: 'callToAction'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    cache: false,
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('changeLevel', {
    url: '/changeLevel',
    cache: false,
    templateUrl: 'templates/changeLevel.html',
    controller: 'changeLevelCtrl'
  })

   .state('exit', {
    url: '/exit',
    cache: false,
    templateUrl: 'templates/exit.html',
    controller: 'exitCtrl'
  })

  .state('statistics', {
  url: '/statistics',
  templateUrl: 'templates/bookingList.html',
  controller: 'statistics'
  
})

.state('userToEnable', {
  url: '/userToEnable',
  cache: false,
  templateUrl: 'templates/userToEnable.html',
  controller: 'UserToEnable'
})

.state('courtsView', {
url: '/courtsView/:datez/:gameType',
cache: false,
templateUrl: 'templates/courtsView.html',
controller: 'courtsView'
})

.state('manageSubscriptions', {
url: '/manageSubscriptions',
cache: false,
templateUrl: 'templates/manageSubscriptions.html',
controller: 'manageSubscribtions'

})

.state('waitingToBeEnabled', {
  url: '/waitingToBeEnabled',
  cache: false,
  templateUrl: 'templates/waitingToBeEnabled.html',
  controller: 'WaitingToBeEnabled'
})

.state('help', {
  url: '/help',
  templateUrl: 'templates/help.html',
  controller: function($scope,$ionicSlideBoxDelegate, $state){
    $scope.slide = function(index) {
      $ionicSlideBoxDelegate.slide(index);
    };
    $scope.close = function (){
      $state.go('tab.dash');
    }
  }
})

.state('invitation', {
  url: '/invitation/:bookingId/:gameType',
  templateUrl: 'templates/invitation.html',
  cache: false,
  controller: 'InvitationCtrl'

})

.state('manageUsers', {
url: '/manageUsers',
cache: false,
templateUrl: 'templates/manageUsers.html',
controller: 'manageUsers'

})

.state('checkNewVersion', {
url: '/checkNewVersion',
cache: false,
templateUrl: 'templates/checkNewVersion.html',
controller: 'checkNewVersionCtrl'

})

.state('stats', {
url: '/stats/:month/:year',
cache: false,
templateUrl: 'templates/stats.html',
controller: 'statsController'

})

.state('privacy', {
url: '/privacy',
cache: true,
templateUrl: 'templates/privacy.html'
})
  
  .state('gameType', {
url: '/gameType',
cache: true,
templateUrl: 'templates/setGameType.html',
controller: 'gameTypeController'
});

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/dash');
$urlRouterProvider.otherwise( function($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("tab.dash");
        });

});
