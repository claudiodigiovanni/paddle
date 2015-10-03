angular.module('starter.filters', [])
.filter('range', function(Utility) {
  return function(input) {
    return Utility.getHoursFromRanges(input)
  };
})
.filter('courtName', function(config) {
  return function(input) {
    return config.PaddleCourtsNames[input-1]
  };
});
