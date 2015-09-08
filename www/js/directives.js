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
      console.log("Calendar controller:" );
      console.log("currentMonth:" + $scope.currentMonth);
      console.log("currentYear:" + $scope.currentYear);
      console.log($scope.weeks);

      $scope.$watch('currentMonth', function() {
        console.log("month:" + $scope.currentMonth);
        $scope.weeks = Utility.getCalendar($scope.currentMonth,$scope.currentYear);
        $rootScope.$broadcast('currentMonthChanged', $scope.currentMonth);
      })

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
    controller: ['$scope', '$http', 'Utility', function($scope, $http, Utility) {

      console.log('monthChanger controller....');
      $scope.monthName = months[$scope.currentMonth];
      //$scope.weeks = Utility.getCalendar($scope.currentMonth,$scope.currentYear);

      $scope.changeMonth = function (pos){
          console.log('changeMonth....' );
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
