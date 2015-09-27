describe('Parse.com', function () {



  var $scope,
    $state,
    $controller,
    Utility,
    MyObjects,
    $httpBackend,
    rootScope,
    $q


    beforeEach(module('ui.router'));
    beforeEach(module('ionic'));
    beforeEach(module('ionic.service.core'));
    beforeEach(module('ionic.service.deploy'));

    beforeEach(
    function () {
        var constants = {
          TennisCourtsNumber: 2,
          PaddleCourtsNumber: 3,
          slotsNumber: 48,
          playersLevels:5
        }
        module('starter.services',function($provide) {
          $provide.constant('config', constants);
        });
    }
  );
    beforeEach(inject(function (
        $rootScope,
        _Utility_,
        _MyObjects_,
        _$q_
        ) {
            rootScope = $rootScope
            $scope = rootScope.$new();
            $q = _$q_
            Utility = _Utility_
            MyObjects=_MyObjects_

            Parse.initialize("BzP3o0EJmy74BMbHQM8htQ7VuNOOeuBezVYlTeMf","e88MtHw7qQ5ol5YTXPsc2hFXCrPRlXDcn1vumVtv");
    }));



  describe('test1',function(){

    it('Auth....',function(done){

      console.log("Going to Auth...");

      Parse.User.logIn("cdg", "cdg2")
      .then(
        function(user){
          done()
      }, function(error){
        done()
        console.log(error);
      })

    rootScope.$apply()
  })

  })


  describe('Constructor', function () {

    it('assigns a name', function (done) {
    console.log('Going to getUsersToEnableTest');
    //console.log(Utility.getCalendar(0,2015));
    var res
    var promise1 = MyObjects.getUsersToEnableTest()
    promise1.then(
      function(obj){
          expect(true).toBe(true);
          _.each(obj,function(item){
            console.log(item.get('username'));
          })
          done();
    }, function(error){
      console.log(error);
      console.log('errore console');
    })


    rootScope.$apply()







    console.log('GetUsers User.....1111');



    expect(true).toBe(true);
     console.log('FINE.....11122');

//done()

    });



  });
})
