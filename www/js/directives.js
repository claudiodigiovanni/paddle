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
      getDayStatus: '&',
      dayClicked:'&',
      weekDays: '=',
      weeks: '='
    },
    templateUrl: 'templates/ng-calendar-template.html',
    replace:true,
    link: function(scope, elm, attrs) {
            console.log('Calendar link....');
          }
  }
})

.directive('monthChanger', function() {
  return {
    restrict: 'E',
    scope: {
        weeks: "="
    },
    templateUrl: 'templates/ng-monthChange-template.html',
    replace:true,
    link: function(scope, elm, attrs) {
            console.log('monthChanger link....');
          },
    controller: ['$scope', '$http', 'Utility', function($scope, $http, Utility) {
      console.log('monthChanger controller....');
      var currentDate = new Date();
      var currentMonth = parseInt(currentDate.getMonth())  ;
      var currentYear = currentDate.getFullYear();
      $scope.currentMonth = currentMonth;
      $scope.currentYear = currentYear;

      $scope.changeMonth = function (pos){
          console.log('changeMonth....');
          currentMonth = parseInt(currentMonth) + parseInt(pos);
          $scope.weeks = Utility.getCalendar(currentMonth,currentYear);
      }



    }]
  }
})
