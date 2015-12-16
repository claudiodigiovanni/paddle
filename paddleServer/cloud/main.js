
var _ = require("underscore");

var Mailgun = require('mailgun');

var moment = require('moment')

var getHoursFromRanges = function(ranges){
      var ret = "";
      _.each(ranges,function(r){
        var end = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        r  = r - 0.5
        var start = (parseInt(r) % 2) === 0 ? parseInt(r) / 2 : (parseInt(r / 2)) + ".30";
        ret += "  " + start + "-" + end;
      })
      return ret;
    }


var sendEmail = function(toAddress,subjectx,textx){
  Mailgun.initialize('sandboxb318624be69540219e6c0e4769735e6b.mailgun.org', 'key-c88b7957c124942a3a24311f0970f929');

  Mailgun.sendEmail({

    to: toAddress,
    from: "Mailgun@CloudCode.com",
    subject: subjectx,
    text: textx
  }, {
    success: function(httpResponse) {
      console.log('sendMail ok');
      //response.success("Email sent!");
      //response.success(user);
    },
    error: function(httpResponse) {
      console.error(httpResponse);
      //response.error("Uh oh, something went wrong sending email");
    }
  });

}

Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world from your Parse Server....!");
  console.log('log server...');
});

Parse.Cloud.afterSave(Parse.Object.extend("Booking"), function(request, response) {

  var toAddress
  var messagex = "..."

  var gameTypes = []
  var id = request.object.id

  var circolo = null;
  var Booking = Parse.Object.extend("Booking")
  var query = new Parse.Query(Booking);
  query.include('players')
  query.include('circolo')
  query.get(id)
  .then(
    function(b){
      //************************
      circolo = b.get('circolo')
      /*gameTypes.push(circolo.get("gameType1"))
      gameTypes.push(circolo.get("gameType2"))
      gameTypes.push(circolo.get("gameType3"))
      var actualGame = gameTypes[b.get('gameType')]
      var numPlayers = parseInt(actualGame.numberPlayers)*/
      var numPlayers = b.get("playersNumber")
      if (b.get('callToAction') == true && b.get("players").length == numPlayers ){
        //sendEmail
        console.log('sendEmail.........');
        var players = b.get("players")
        _.each(players,function(item){
            //console.log(item);
            var toAddress = item.get('email')
            sendEmail(toAddress,"La Partita si farà!" ,"La Partita si farà! ")
        })

      }
      //***********************

  }, function(error){
    console.log(error);
  })
  .then(
    function(){
        var Booking = Parse.Object.extend("Booking");
        var query = new Parse.Query(Booking);
        query.equalTo('circolo',circolo)
        query.greaterThanOrEqualTo("date", new Date());
        //query.lessThanOrEqualTo("date", endDate);
        query.ascending("date");
        query.include('user');
        query.include('maestro');
        return query.find()

    }, function(error){
      console.log(error);
    })
  .then(
    function(queryResult){

      _.each(queryResult,function(item){

        var date = moment(item.get("date")).add('days',1);
        console.log(date)

        var lastOne = ""
        if (id == item.id)
          lastOne = "***"
        messagex = messagex.concat( lastOne,"Campo: " ,item.get("court") , 
                                    " - Datax: " , date.format("DD/MM/YYYY")  , 
                                    " - Orario: " , getHoursFromRanges(item.get("ranges")),
                                    " - Utente: " , item.get("user").get("nome"),
                                    " - Tel: " , item.get("user").get("phoneNumber"),
                                    " - Maestro: ", item.get("maestro") != null ? item.get("maestro").get("nome") : "-" , lastOne,"\n")
                
      })
      return messagex
    }, function(error){
    console.log(error);
    })
  .then(
      function(messagex){

      //console.log(messagex)

      //************SEND EMAIL TO ADMIN****************
      
      var query = new Parse.Query(Parse.User);
      console.log("CIRCOLO")
      console.log(circolo)
      query.equalTo('circolo',circolo)
      query.equalTo('role','admin')

      return query.first()
    })
    .then(
        function(admin){
          toAddress = admin.get('email')
      }, function(error){
        console.log(error);
      })
      .then(
        function(obj){
          console.log(toAddress);
          sendEmail(toAddress,"Prenotazione Utente",messagex)
      }, function(error){
        console.log(error);
      }) 
      //****************************
      
});

Parse.Cloud.define("enableUser", function(request, response){
  Parse.Cloud.useMasterKey();

  //circoloId è il circolo dell'amministratore che concede l'abilitazione....
  var Circolo = Parse.Object.extend("Circolo");
  var circolo = new Circolo();
  circolo.id = request.params.circoloId

  var query = new Parse.Query(Parse.User);
  query.get(request.params.userId)
  .then(
    function(user){

      //L'utente, già iscritto, ha chiesto l'abilitazione ad un altro circolo
      if (user.get("subscriptions").indexOf(circolo.id) == -1){
          user.add('subscriptions',circolo.id)
          user.save()
          var SubscriptionRequest = Parse.Object.extend("SubscriptionRequest");
          var query = new Parse.Query(SubscriptionRequest)
          query.equalTo("user",user)
          query.equalTo("circolo",circolo)
          query.first()
          .then(
            function(sr){
              sr.destroy()
              sendEmail(user.get('email'),"Iscrizione","La tua richiesta di iscrizione a Magic Booking è stata accettata. Complimenti!")
              response.success('Abilitazione ok!!!')

          }, function(error){
            console.log(error);
            response.error(error);
          })
      }
      //L'utente ha chiesto l'iscrizione per la prima volta
      else {
        user.set('enabled',true)
        user.save()
        sendEmail(user.get('email'),"Iscrizione","La tua richiesta di iscrizione a Magic Booking è stata accettata. Complimenti!")
        response.success('Abilitazione ok!!!')


      }

  }, function(error){
    console.log(error);
    response.error(error);
  })


});


Parse.Cloud.define("login", function(request, response){
  Parse.Cloud.useMasterKey();
  Parse.User.logIn(request.params.username, request.params.password, {
      success: function(user) {
        // Do stuff after successful login.
        if (user.get('enabled') == true)
          response.success(user.getSessionToken());
        else {
          response.error("Utente non Abilitato");
        }
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        //alert (error);
        response.error(error);
      }
    });
});

Parse.Cloud.define("signUp", function(request, response){

  var user = new Parse.User();
  user.set("email", request.params.email.toLowerCase());
  user.set("username", request.params.username.toLowerCase());
  user.set("password", request.params.password);
  user.set("level", request.params.level)
  user.set("enabled",false)
  user.set("nome",request.params.nome )
  user.set("phoneNumber",request.params.phoneNumber)
  user.set("codfis",request.params.codfis)
  var Circolo = Parse.Object.extend("Circolo");
  var c = new Circolo();
  c.id = request.params.circolo
  user.set("circolo", c)
  user.add("subscriptions",c.id)

  console.log('CaptchaCode:');
  console.log(request.params.captchaResponse);

  var platform = request.params.platform;

  /*if (platform != 'ios' && platform != 'android'){
      var googleParams = "secret=6Lc5tw4TAAAAAHwt9evSu8Txn6odKxqEUs1T9AI5&response=" +  request.params.captchaResponse

      Parse.Cloud.httpRequest({
            url: 'https://www.google.com/recaptcha/api/siteverify?' + googleParams
        })
        .then(
          function(httpResponse){
            console.log('Verifica Captcha ok!!!!......................');
            console.log(httpResponse.text);
            if ( httpResponse.text.success == 'false'){
              response.error("Verifica Captcha non superata....");

            }
        }, function(httpResponse){
          console.log('Verifica Captcha NOT ok!!!');
            console.log(httpResponse);
            response.error("Uh oh, something went wrong verifyng Captcha...");
        })
  }*/


  user.signUp(null, {
    success: function(user) {
      console.log('Going to Admin Address...');



      var toAddress
      var query = new Parse.Query(Parse.User);
      query.equalTo('circolo',user.get('circolo'))
      query.equalTo('role','admin')

      query.first()
      .then(
        function(admin){
          toAddress = admin.get('email')
      }, function(error){
        console.log(error);
        response.error(error);
      })
      .then(
        function(obj){
          console.log('Admin Address...');
          console.log(toAddress);
          sendEmail(toAddress,"Iscrizione Utente","L'utente " + request.params.username + " ha richiesto l'Iscrizione a Magic Paddle. ")
          response.success('Richiesta inviata con successo');


      }, function(error){
        console.log(error);
        response.error(error);
      })



    },
    error: function(user, error) {
      response.error(error);
    }
  });
});

var followUpWithRequestForSubscription = function(circolo,user,userName,response){

  var SubscriptionRequest = Parse.Object.extend("SubscriptionRequest");
  var sr = new SubscriptionRequest();
  sr.set("circolo",circolo)
  sr.set("user",user)
  return sr.save()
  .then(
    function(sr){
      var query = new Parse.Query(Parse.User);
      query.equalTo('circolo',circolo)
      query.equalTo('role','admin')
      return query.first()

  }, function(error){
    console.log(error);
    response.error(error);
  })
  .then(
    function(admin){
      var toAddress = admin.get('email')
      sendEmail(toAddress,"Iscrizione Utente","L'utente " + userName + " ha richiesto l'Iscrizione a Magic Paddle per il tuo circolo... ")
      response.success('Richiesta inviata con successo');

  }, function(error){
    console.log(error);
    response.error(error);
  })


}

Parse.Cloud.define("requestForSubscription", function(request, response){

  var Circolo = Parse.Object.extend("Circolo");
  var circolo = new Circolo();
  circolo.id = request.params.circoloId

  var user = new Parse.User()
  user.id = request.params.userId

  var userName = request.params.userName

  var SubscriptionRequest = Parse.Object.extend("SubscriptionRequest");
  var query = new Parse.Query(SubscriptionRequest)
  query.equalTo("user",user)
  query.equalTo("circolo",circolo)

  query.find({
    success:function(results){
        if (results.length > 0)
          response.error("Richiesta già inviata");
        else {
          followUpWithRequestForSubscription(circolo,user,userName,response)
        }
    },
    error: function(error){
        response.error(error);
    }
  })

});

var InvitationRequestFollowUp = function(response,user,booking){

  var InvitationRequest = Parse.Object.extend("InvitationRequest");
  var ir = new InvitationRequest()
  ir.set('user',user)
  ir.set('booking',booking)
  ir.save()
  .then(
    function(obj){
      sendEmail(user.get('email'),"Invito Utente","Sei stato inviato ad una partita! Collegati a Magic Booking per scoprire che è il mittente!! ")
      response.success('ok')
  }, function(error){
    console.log(error);
    response.error(error)
  })

}

  Parse.Cloud.define("invite", function(request, response){


    var userId = request.params.user
    var bookingId = request.params.booking

    var user = new Parse.User()
    user.id = userId

    var Booking = Parse.Object.extend("Booking");
    var booking = new Booking()
    booking.id = bookingId

    var InvitationRequest = Parse.Object.extend("InvitationRequest");
    var query = new Parse.Query(InvitationRequest)
    query.equalTo('user',user)
    query.equalTo('booking',booking)
    query.find()
    .then(
      function(results){
        if (results.length > 0){
          response.error("Utente già invitato....")
        }
        else{
          InvitationRequestFollowUp(response,user,booking)
        }

    }, function(error){
      console.log(error);
      response.error(error)
    })


});
