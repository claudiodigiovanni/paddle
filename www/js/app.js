// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core','ionic.service.push','ngCordova','ionic.service.deploy', 'ngIOS9UIWebViewPatch', 'starter.controllers', 'starter.services','starter.directives','starter.filters','vcRecaptcha'])

.run(function($ionicPlatform,$rootScope, $state) {
  $ionicPlatform.ready(function() {
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

    Parse.initialize("BzP3o0EJmy74BMbHQM8htQ7VuNOOeuBezVYlTeMf","e88MtHw7qQ5ol5YTXPsc2hFXCrPRlXDcn1vumVtv");




    $rootScope.$on('$stateChangeStart', function (event, next) {
        var currentUser = Parse.User.current();
        $rootScope.platform = ionic.Platform.platform()

        if(next.name =='login' || next.name== 'signUp' || next.name == 'waitingToBeEnabled') {

           console.log('verso login...');

         }

        else if (currentUser) {

            $rootScope.currentUser = currentUser;
            $rootScope.userRole = currentUser.get('role')

            //console.log(currentUser.get('role'));
        } else {
            // show the signup or login page
            console.log('currentUser is null.!!');
            $state.go('login');
            event.preventDefault();

        }
        return;

    });

})

.constant('config', {
  ClayTennisCourtsNumber: 2,
  HardTennisCourtsNumber: 2,
  PaddleCourtsNumber: 3,
  slotsNumber: 48,
  playersLevels:5
})

/*.config(
  function($httpProvider) {
    $httpProvider.interceptors.push(function($q) {
        return {
            request: function(config){
              //console.log(config);
              return config;

            },
            requestError: function(rejection){
              console.log(rejection);
              return $q.reject(rejection);

            },
            response: function(response){
              //console.log(response);
              return response;

            },
            responseError: function(res){
                console.log("Failed to open url: " + res.config.url, res);
                //Angular returns "success" by default, but we will call "error" if data were not obtained.
                if(res.data == null && res.status === 0 && res.statusText === ""){
                    return $q.reject(res) //callback error()
                }
                return res //return default success()
            }
        };

      }
    );
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

  .state('tab.bookCoach', {
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
    })

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
});


  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/dash');
  $urlRouterProvider.otherwise( function($injector, $location) {
            var $state = $injector.get("$state");
            $state.go("tab.dash");
        });

});
