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
      currentYear: "=",
      showAll: '@'
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
        
        if (day == '-')
          return "disabled";

        //Per segreteria e amministratore tutti i giorni sono disponibili per permettere di vedere
        //le prenotazioni dei giorni recedenti
        if ($scope.showAll)
          return 'avalaible'; 

        if (selectedDate < today )
          return "disabled";

        //Se non seleziono il maestro considero tutti i giorni disponibili
        if (!$scope.coach)
          return 'avalaible';

        if ($scope.selectedDay == day){
          return "selected";
        }

        var e = _.find($scope.coachAvalabilities,function(obj){
            return (obj.day == day );
        });
        
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
        controller: ['$scope', '$http', 'Utility', '$rootScope', 'MyObjects','$state','$ionicPopup',function($scope, $http, Utility, $rootScope, MyObjects,$state,$ionicPopup) {

          //console.log($rootScope.userRole)
          $scope.userRole = $rootScope.userRole



          $scope.payment = function(booking,type,qty){
            
            MyObjects.payment(booking,type,qty)
            //MyObjects.findBookings(2,2015)

          }

          $scope.saveNote = function(booking){
            console.log('saveNote...' + booking.note)
            MyObjects.saveNote(booking)
            //MyObjects.findBookings(2,2015)

          }

          $scope.gotoInvitation = function(booking){
            $state.go('invitation',{'bookingId':booking.id,'gameType':booking.get('gameType')})
          }

          $scope.info = function(){
            $ionicPopup.alert({
               title: 'Info',
               template: "Trascina verso destra l'elemento per visualizzare le opzione disponibili." 
             });
          }


        }]
    }
})

.directive('weather', function() {
    return {
        restrict: 'E',
        scope: {
          date: '='
        },
        templateUrl: 'templates/ng-show-weather.html',
        controller: ['$scope', '$http', 'weatherService', '$rootScope', '$q', function($scope, $http, weatherService, $rootScope,$q) {

          $scope.$watch('date',function(obj){

            console.log($scope.date);

            var dataChart = {}

            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);

            var maxForecastDate = today
            maxForecastDate.setDate(today.getDate() + 4)

            if ($scope.date == null || $scope.date > maxForecastDate){
              $scope.dataChart = dataChart
              return dataChart
            }


            console.log("AVANTI!!!!");

            //-----------INIZIO WATCH----------
            var forecastDay = []
            weatherService.getWeather5Days().then(function(data){

            console.log(data);
            forecastDay = _.filter(data.list,function(f){

              console.log(f.weather[0].icon);

              return (new Date(f.dt*1000).getDate() == $scope.date.getDate())


              //http://openweathermap.org/img/w/10d.png
            })

            console.log(forecastDay);
            })
            .then(
            function(obj){


              var h = []
              /*var t = []
              var r = []
              var w = []*/
              var i = []

              _.each(forecastDay, function(f){

                h.push(new Date(f.dt*1000).getHours())
                /*t.push(f.main.temp)
                r.push(f.rain['3h'])
                w.push(f.wind.speed)*/
                i.push("http://openweathermap.org/img/w/" + f.weather[0].icon + ".png" )

              })

              //dataChart = {hour:h,temp:t,rain:r,wind:w, icon:i}
              dataChart = {hour:h,icon:i}
              console.log(dataChart);
              $scope.dataChart = dataChart

              console.log($scope.day);
            //-----------FINE WATCH------------



          })


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
