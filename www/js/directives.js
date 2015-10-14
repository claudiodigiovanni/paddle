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
      coach: "=",
      coachAvalabilities: '=',
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

        if (selectedDate < today || day == '-')
          return "disabled";

        //Se non seleziono il maestro considero tutti i giorni disponibili
        if (!$scope.coach)
          return 'avalaible';

        var e = _.find($scope.coachAvalabilities,function(obj){
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
})

.directive('weather', function() {
    return {
        restrict: 'E',
        scope: {
          day: '='
        },
        templateUrl: 'templates/ng-show-weather.html',
        controller: ['$scope', '$http', 'weatherService', '$rootScope', '$q', function($scope, $http, weatherService, $rootScope,$q) {


          var forecastDay = []
          weatherService.getWeather5Days().then(function(data){

          console.log(data);
          forecastDay = _.filter(data.list,function(f){

            console.log('xxxxxxxxxx');
            console.log(f.dt_txt);
            console.log(f.main.temp);
            console.log(f.rain['3h']);
            console.log(f.wind.speed);
            console.log(f.weather[0].icon);

            return (new Date(f.dt*1000).getDate() == $scope.day)


            //http://openweathermap.org/img/w/10d.png
          })

          console.log(forecastDay);
        })
        .then(
          function(obj){
            var dataChart = [
              ['Ora', 'Temp', 'Pioggia(mm)', 'Vento(m/s)']
            ]

            _.each(forecastDay, function(f){
              var item = []
              item.push(new Date(f.dt*1000).getHours())
              item.push(f.main.temp)
              item.push(f.rain['3h'])
              item.push(f.wind.speed)
              dataChart.push(item)
            })
            console.log(dataChart);
            var data = google.visualization.arrayToDataTable(dataChart)

            var options = {
              title: 'Previsioni Meteo',
              vAxis: {title: 'Quantità'},
              hAxis: {title: 'Ora', ticks: [0,3,8,12,15,18,21,24] },
              seriesType: 'bars',
              series: {4: {type: 'line'}}
            };
            var chart = new google.visualization.ComboChart(document.getElementById('chartdiv'));

            chart.draw(data, options);

        }, function(error){
          console.log(error);
        })




        /*var data = google.visualization.arrayToDataTable([
        ['Ora', 'Temp', 'Pioggia', 'Vento'],
        ['2004', 1000, 400],
        ['2005', 1170, 460],
        ['2006', 660, 1120],
        ['2007', 1030, 540]
      ]);*/








        }]
    }
});
