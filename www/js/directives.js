angular.module('starter.directives', [])

.directive('hoursRange', function() {
  return {
    restrict: 'A',
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
});
