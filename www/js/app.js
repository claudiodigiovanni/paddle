// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','starter.directives'])

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
        console.log("currentUser:");
        console.log(currentUser);
        //console.log(currentUser.get('maestro') != undefined);
        if(next.name =='login' || next.name== 'signUp') {
           //event.preventDefault();
           //$state.go('login');
         }

        else if (currentUser) {
            // do stuff with the user
            //event.preventDefault();
            //$state.go('tab.dash');
            $rootScope.currentUser = currentUser;
        } else {
            // show the signup or login page
            console.log('currentUser is null!!');
            event.preventDefault();
            $state.go('login');
        }

    });

})

.constant('config', {
  TennisCourtsNumber: 2,
  PaddleCourtsNumber: 3,
  slotsNumber: 48
})
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'Login'

  })

  .state('signUp', {
  url: '/signUp',
  templateUrl: 'templates/login.html',
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
      views: {
        'tab-bookCoach': {
          templateUrl: 'templates/coachAvalabilities.html',
          controller: 'CoachAvalabilities'
        }
      }
    })

  .state('tab.bookCourt', {
      url: '/bookCourt',
      views: {
        'tab-bookCourt': {
          templateUrl: 'templates/bookCourt.html',
          controller: 'BookCourt'
        }
      }
    })

  .state('tab.callToAction', {
      url: '/callToAction',
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
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
