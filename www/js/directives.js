angular.module('starter.directives', [])

.directive('hoursRange', function() {
  return {
    restrict: 'E',
    scope: {
      setRangeStatus: '&',
      getRangeStatus:'&'
    },
    templateUrl: 'templates/ng-rangeHours-template.html',
    replace:true,
    link: function(scope, elm, attrs) {
            console.log('link....');
          }
  }
})

.directive('calendar', function() {
  return {
    restrict: 'E',
    scope: {
      avalabilities: '=',
      selectedDay: '=',
      selectedays: '=',
      dayClicked:'&',
      currentMonth: "=",
      currentYear: "="
    },
    templateUrl: 'templates/ng-calendar-template.html',
    replace:true,
    link: function(scope, elm, attrs) {
            console.log('Calendar link....');


          },
    controller: ['$scope', '$http', 'Utility','$rootScope', function($scope, $http, Utility, $rootScope) {
      var weekDays = ['L','Ma','Me','G','V','S','D']
      $scope.weekDays = weekDays;
      $scope.weeks = Utility.getCalendar($scope.currentMonth,$scope.currentYear);

      $scope.$watch('currentMonth', function() {

        $scope.weeks = Utility.getCalendar($scope.currentMonth,$scope.currentYear);
        $rootScope.$broadcast('currentDateChanged', $scope.currentMonth + ":" + $scope.currentYear );
      })

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

        var e = _.find($scope.avalabilities,function(obj){
            return (obj.day == day );
        });
        if ($scope.selectedDay == day){
          return "selected";
        }
        if ( e ){
          return 'avalaible';
        }
        if ($scope.selectedays && $scope.selectedays.indexOf(day) != -1){
          return 'multiple-select';
        }
        if (selectedDate.getTime()=== today.getTime())
          return "today"

        else {
          return 'na'
        }

      };

    }]
  }
})

.directive('monthChanger', function() {
  var months = ['Gennaio','Febbraio','Marzo','Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  return {
    restrict: 'E',
    scope: {
        currentMonth: "=",
        currentYear: "="
    },
    templateUrl: 'templates/ng-monthChange-template.html',
    replace:true,
    link: function(scope, elm, attrs) {
            console.log('monthChanger link....' + scope.currentMonth) ;
          },
    controller: ['$scope', '$http', 'Utility', '$rootScope', function($scope, $http, Utility, $rootScope) {


      $scope.monthName = months[$scope.currentMonth];
      //$scope.weeks = Utility.getCalendar($scope.currentMonth,$scope.currentYear);

      $scope.changeMonth = function (pos){

          var tmp = parseInt($scope.currentMonth) + parseInt(pos);
          if (tmp == 12){
              $scope.currentMonth = 0;
              $scope.currentYear = parseInt($scope.currentYear) + 1;
          }
          else if (tmp == -1){
            $scope.currentMonth = 11;
            $scope.currentYear = parseInt($scope.currentYear) -1 ;
          }
          else {
            $scope.currentMonth = tmp;
          }
          $scope.monthName = months[$scope.currentMonth];


      }


    }]
  }
})


.directive('showBookings', function() {
    return {
        restrict: 'E',
        scope: {
          bookings: '=' ,
          pay: '&',
          delete: '&',
          date: '=',
          text: '@',
          showpay: '@'
        },
        templateUrl: 'templates/ng-show-bookings-template.html',
        controller: ['$scope', '$http', 'Utility', '$rootScope', function($scope, $http, Utility, $rootScope) {



        }]
    }
});
