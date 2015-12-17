// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('starter', ['ionic','ionic.service.core','ionic.service.push','ngCordova','ionic.service.deploy', 'ngIOS9UIWebViewPatch', 'starter.controllers', 'starter.services','starter.directives','starter.filters','vcRecaptcha'])

.run(function($ionicPlatform,$rootScope, $state,$cordovaSplashscreen,$timeout,$ionicLoading) {





  $ionicPlatform.ready(function() {

    if ($rootScope.platform == 'ios' || $rootScope.platform == 'android' ){
      $timeout(function() {
            $cordovaSplashscreen.hide()
        }, 100)
    }



    console.log('ok init.....');


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

    Parse.initialize("MteACDZVcFz7FCTlvjp1x5DXIaLlmEQxqtIayE7o","kCH6rpFSzc4PUR3g6NvWnHKLHcmcpzrJbTdnteVc");




    $rootScope.$on('$stateChangeStart', function (event, next) {
        var currentUser = Parse.User.current();
        $rootScope.platform = ionic.Platform.platform()

        if(next.name =='login' || next.name== 'signUp' || next.name == 'waitingToBeEnabled') {

           console.log('verso login...');

         }

        else if (currentUser) {

            $rootScope.currentUser = currentUser;
            $rootScope.userRole = currentUser.get('role')

            //console.log($rootScope.userRole)

            if ($rootScope.gameTypes == null){
              $rootScope.gameTypes = JSON.parse(window.localStorage['gameTypes'])

            }

            
  
        } else {
            // show the signup or login page
            console.log('currentUser is null.!!');
            $state.go('login');
            event.preventDefault();

        }
        return;

    });

    /*var loadingOpen = 0;

    $rootScope.$on('loading:show', function() {
      loadingOpen = parseInt(loadingOpen) +1
      if (loadingOpen == 1){
          $ionicLoading.show({template: 'uhauuu....'})
      }
    })
    $rootScope.$on('loading:hide', function() {
      loadingOpen = parseInt(loadingOpen) - 1
      if (loadingOpen == 0){
        $ionicLoading.hide()
      }
    })*/

})

.constant('config', {
  //ClayTennisCourtsNumber: 2,
  //HardTennisCourtsNumber: 2,
  //PaddleCourtsNumber: 3,
  slotsNumber: 48,
  playersLevels:6,
  //PaddleCourtsNames: ['Rosso','Blu','Verde']
})


/*.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        console.log('request');
        console.log(config);
        $rootScope.$broadcast('loading:show')
        return config
      },
      requestError: function(rejection) {
        $rootScope.$broadcast('loading:hide')
        return rejection
      },
      response: function(response) {
        //console.log('response');
        $rootScope.$broadcast('loading:hide')
        return response
      },
      responseError: function(rejection) {
        $rootScope.$broadcast('loading:hide')
        return rejection
      }
    }
  })
})*/

.config(function($stateProvider, $urlRouterProvider) {


  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

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

  .state('tab.setAvalability', {
      url: '/setAvalability',
      views: {
        'tab-setAvalability': {
          templateUrl: 'templates/setAvalability.html',
          controller: 'SetAvalability'
        }
      }
    })

  /*.state('tab.bookCoach', {
      url: '/bookCoach',
      views: {
        'tab-bookCoach': {
          templateUrl: 'templates/bookCoach.html',
          controller: 'BookCoach'
        }
      }
    })

  .state('tab.coachAvalabilities', {
      url: '/coachAvalabilities/:coachId',
      cache: false,
      views: {
        'tab-bookCoach': {
          templateUrl: 'templates/coachAvalabilities.html',
          controller: 'CoachAvalabilities'
        }
      }
    })*/

  .state('tab.bookCourt', {
      url: '/bookCourt',
      cache: false,
      views: {
        'tab-bookCourt': {
          templateUrl: 'templates/bookCourt.html',
          controller: 'BookCourt'
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

  .state('tab.statistics', {
  url: '/statistics',
  views: {
    'tab-account': {
      templateUrl: 'templates/bookingList.html',
      controller: 'statistics'
    }
  }

})

.state('tab.userToEnable', {
url: '/userToEnable',
cache: false,
views: {
  'tab-account': {
    templateUrl: 'templates/userToEnable.html',
    controller: 'UserToEnable'
  }
}
})

.state('tab.manageSubscriptions', {
url: '/manageSubscriptions',
cache: false,
views: {
  'tab-account': {
    templateUrl: 'templates/manageSubscriptions.html',
    controller: 'manageSubscribtions'
  }
}
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
  controller: 'InvitationCtrl'

});


  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/dash');
  $urlRouterProvider.otherwise( function($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("tab.dash");
        });

});
