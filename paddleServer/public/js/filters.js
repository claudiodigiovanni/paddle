angular.module('starter.filters', [])
.filter('range', function(Utility) {
  return function(input) {
    return Utility.getHoursFromRanges(input)
  };
})
.filter('courtName', function($rootScope) {
  return function(court,gameType) {
    if (gameType == null || $rootScope.gameTypes == null)
      return court
    var game = $rootScope.gameTypes[parseInt(gameType)]
    //console.log(gameType);
    return game.courtsNames[parseInt(court)-1]
  };
})
.filter('gameName', function($rootScope) {
  return function(gameType) {
    if (gameType == null || $rootScope.gameTypes == null)
      return court
    var game = $rootScope.gameTypes[parseInt(gameType)]
    //console.log(gameType);
    return game.name
  };
});
