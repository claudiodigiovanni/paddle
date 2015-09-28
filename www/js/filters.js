angular.module('starter.filters', []).filter('range', function(Utility) {
  return function(input) {
    return Utility.getHoursFromRanges(input)
  };
});
