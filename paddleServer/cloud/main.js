
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

var sendPushForCall = function(circolo, level,userName,date){
    
        console.log('sendPushForCall')
         if (level == null)
             return
        
         Parse.Cloud.useMasterKey();
         var query = new Parse.Query(Parse.Installation);
         var innerQuery1 = new Parse.Query(Parse.User);
         innerQuery1.equalTo("level",level)
         innerQuery1.equalTo("circolo",circolo)
         var innerQuery2 = new Parse.Query(Parse.User);
         innerQuery2.equalTo("level",level-1)
         innerQuery2.equalTo("circolo",circolo)
         var mainInnerQuery = Parse.Query.or(innerQuery1, innerQuery2);
         query.include('user')
         query.matchesQuery('user',mainInnerQuery)
         query.each(
             function(installation){
                 
                 sendPush(installation.get('user').id,"Ciao! " + userName + " giocherà un match giorno "  + date  + ". Se vuoi puoi unirti (sempre che qualcuno non sia stato più veloce di te!) andando nella sezione Open Games dell'App.")
             },
             function(error){
                 console.log(error)
             }
         )

}

Parse.Cloud.define("hello", function(request, response) {
        console.log('hello')
        response.success("Hello world from your Parse Server....! " + inside);
             
});

var addUserToRoleNamed = function(user, roleName) {
    var query = new Parse.Query(Parse.Role);
    query.equalTo("name", roleName);
    return query.first().then(function(role) {
        var relation = role.relation("users");
        
        relation.add(user);
        return role.save();
       
    }, function(error){
      console.log(error)
    });
}

Parse.Cloud.define("addUsertoRole", function(request, response) {

  var promises = []
  var usernames = ['admin','segreteria']
  var role = 'admin'
  var query = new Parse.Query(Parse.User);
  _.each(usernames,function(uname){
      query.equalTo("username", uname);  
      var p = query.first().then(function(user) {
         return addUserToRoleNamed(user, role)
           
      },function(error){
        console.log(error)
      })
      promises.push(p)
      
  })

  Parse.Promise.when(promises).then(function() {
    response.success("All worked");
  }, function(err) {
      console.log(err)
      response.error(err);
  });


  

});

Parse.Cloud.beforeSave(Parse.Object.extend("Booking"), function(request, response) {
  
  var mybooking = request.object
  var query = new Parse.Query(Parse.Role);
  query.equalTo("name", "admin");
  query.equalTo("users", Parse.User.current());
  query.first().then(function(adminRole) {
        if (! adminRole && mybooking.get('payed') == true) {
            response.error('operazione non permessa')
            return
        }
        //****************SOLO gli utenti con ruolo ADMIN posso settare il campo payed a true*****************
        if (mybooking.get('payed') == true){
            response.success()
            return    
        }
        var ranges = mybooking.get('ranges')
        
        //Se la prenotazione non è stata appena creata non fare nulla altrimenti controlla.
        if (mybooking.createdAt != null )
          response.success()
        else{
              var Booking = Parse.Object.extend("Booking");
              var query = new Parse.Query(Booking);
              query.equalTo("date", mybooking.get('date'));
              query.equalTo("gameType",mybooking.get('gameType'));
              var c = Parse.User.current().get('circolo')
              query.equalTo('circolo',c)
              query.equalTo('court',mybooking.get('court'))
              query.find().then(
                function(results){
                  var tmp = []
                  _.each(results, function (item){
                      tmp.push(item.get('ranges'))
                  })

                  var otherGamesRanges = _.flatten(tmp)
                  
                  var intersection = _.intersection(ranges,otherGamesRanges)
                  if (intersection.length > 0)
                    response.error('Ooooops!!! Prenotazione non disponibile!!!')

                  else
                   response.success()
                  
                })
        }
  //*******************************************************************************************************  
  }) 
  
});

Parse.Cloud.afterSave(Parse.Object.extend("Booking"), function(request, response) {

  //Il pagamento è l'ultima modifica.
  var mybooking = request.object
  if (mybooking.get('payed')){
      response.success()
      return
  }
      
  var toAddress
  var messagex = ""
  var gameTypes = []
  var id = request.object.id

  var circolo = null;
  var userLevel = null
  var Booking = Parse.Object.extend("Booking")
  var query = new Parse.Query(Booking);
  query.include('players')
  query.include('user')
  query.include('circolo')
  query.get(id)
  .then(
    function(b){
      //************************
      circolo = b.get('circolo')
      userLevel = b.get("user").get("level")
      
      var date = moment(b.get("date")).add('days',1);
      var numPlayers = b.get("playersNumber")
      
      if (b.get('callToAction') == true && b.get("players").length == numPlayers ){
        var players = b.get("players")
        _.each(players,function(item){
            //console.log(item);
            //var toAddress = item.get('email')
            //sendEmail(toAddress,"La Partita si farà!" ,"La Partita si farà! ")
            sendPush(item.id,"La Partita del "  + date.format("DD/MM/YYYY")  + " si farà!")
        })
        throw "completed"
      }
        
      if (b.get('callToAction')){
          sendPushForCall(circolo,userLevel, b.get("user").get("nome"), date.format("DD/MM/YYYY"))
      }
        
      
      if (b.createdAt.getTime() != b.updatedAt.getTime())
        throw "completed"
      
      
      messagex = "Campo: " + b.get("court") +  " - Data: " + date.format("DD/MM/YYYY") + " - Orario: " + getHoursFromRanges(b.get("ranges")) + " - Utente: " +  b.get("user").get("nome") +  " - Tel: " + b.get("user").get("phoneNumber") + "- Maestro: " + (b.get("maestro") != null ? b.get("maestro").get("nome") : "---")

      var queryU = new Parse.Query(Parse.User);
      queryU.equalTo('circolo',circolo)
      queryU.equalTo('role','admin')

      return queryU.first()
      //***********************

  }, function(error){
    console.log(error);
    throw error
  })
  .then(
      function(admin){
        toAddress = admin.get('email')
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
  user.set("residualCredit",0)
  user.set("nome",request.params.nome.toLowerCase() )
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

/* La funzione di iscrizione a più circoli è stata disabilitata.
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

});*/

/*
var InvitationRequestFollowUp = function(response,user,mail,booking){

  var InvitationRequest = Parse.Object.extend("InvitationRequest");
  var ir = new InvitationRequest()
  ir.set('user',user)
  ir.set('booking',booking)
  ir.save()
  .then(
    function(obj){
      
      //sendEmail(mail,"Invito Utente","Sei stato inviato ad una partita! Collegati a Magic Booking per scoprire chi è il mittente!! ")
      sendPush (user.id,'Sei stato invitato ad una partita! Vai nella pagina account, sezione inviti, per scoprire chi è il mittente!')
      response.success('ok')
  }, function(error){
    console.log(error);
    response.error(error)
  })

}

  Parse.Cloud.define("invite", function(request, response){


    var userId = request.params.user
    var bookingId = request.params.booking
    var mail = request.params.mail

    var user = new Parse.User()
    user.id = userId

    var Booking = Parse.Object.extend("Booking");
    var booking = new Booking()
    booking.id = bookingId
    var query = new Parse.Query(Booking)
    query.equalTo('objectId',bookingId)
    query.equalTo('players',user)
    return query.find()
    .then(function(results){

      console.log('*************INVITE************RESULTS')
      console.log(results)
      
      if (results != null && results.length > 0){
        //response.error("L'utente è gia della partita!")
        throw "L'utente è gia della partita!"
      }
    },function(error){
      throw error
    })
    .then(function(){
      var InvitationRequest = Parse.Object.extend("InvitationRequest");
      var query = new Parse.Query(InvitationRequest)
      query.equalTo('user',user)
      query.equalTo('booking',booking)
      return query.find()
    },function(error){
      throw error
    })
    .then(
      function(results){
        if (results.length > 0){
          response.error("Utente già invitato....")
        }
        else{
          InvitationRequestFollowUp(response,user,mail,booking)
        }

    }, function(error){
      console.log(error);
      response.error(error)
    })

})
*/

//******************************************************************************************
/*Parse.Cloud.define("changeUserField", function(request, response){
  Parse.Cloud.useMasterKey();

  var userId = request.params.userId
  var field = request.params.field
  var newValue = request.params.newValue
  var query = new Parse.Query(Parse.User);
  query.get(userId)
  .then(
    function(user){
          user.set(field,newValue)
          user.save()
          response.success("campo " + field + " modificato con successo...")
      
  }, function(error){
    console.log(error);
    response.error(error);
  })


});*/


Parse.Cloud.afterSave(Parse.Object.extend("Payment"), function(request, response) {
  //moment.locale('it');
  var id = request.object.id
  var Payment = Parse.Object.extend("Payment");
  var query = new Parse.Query(Payment)
  query.include("user")
  query.include("booking")
  query.get(id).then(
    function(payment){
      var playDate = moment(payment.get('booking').get('date')).format('LL')
      //var email = payment.get('user').get('email')
      //sendEmail(email,"Pagamento Partita","Ti è stata appena debitata una quota per la partita che hai disputato il " + playDate + ". Grazie!" )
      var message = "Ti è stata appena debitata una quota per la partita che hai disputato il " + playDate + ". Grazie!"
      if (payment.get('user') != null)
        sendPush(payment.get('user').id,message)
    })

 
  
})

//Solo che ha Role (Classe nativa Parse) può modificare i campi di un altro user
//Al ruolo admin appaartengono utenti tipo admin e segreteria
//Il ruolo admin è protetto in scrittura 
Parse.Cloud.define("changeUserField", function(request, response){
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.Role);
  query.equalTo("name", "admin");
  query.equalTo("users", Parse.User.current());
  query.first().then(function(adminRole) {
      if (adminRole) {
          console.log("user is an admin");
          //*****************************
            var userId = request.params.userId
            var field = request.params.field
            var newValue = request.params.newValue
            var query = new Parse.Query(Parse.User);
            query.get(userId)
            .then(
              function(user){
                    user.set(field,newValue)
                    user.save().then(function(user){
                      response.success("campo " + field + " modificato con successo...")
                    },function(error){
                      response.error(error);
                      console.log(error)})
                    
                
            }, function(error){
              console.log(error);
              response.error(error);
          })
          //*****************************
      } else {
          console.log("user is not an admin");
          response.error("Utente non abilitato");
      }
  });

 
  

});



Parse.Cloud.define("createInstallationObject", function(request, response){
var token = request.params.token;
var platform = request.params.platform;
var user = request.user;
 
  // Need the Master Key to update Installations
  Parse.Cloud.useMasterKey();

  // A user might have more than one Installation
  var installation = new Parse.Installation;
  installation.set('deviceToken',token)
  installation.set('deviceType',platform)
  installation.set('user',user)
  if (platform == "android"){
      installation.set('GCMSenderId','793980463534')
      installation.set('pushType','gcm')
      console.log('.......android')
  }  
  var channels = ['mb']
  installation.set('channels',channels)
  installation.save().then(function(success){
  response.success("ok createInstallationObject " )
    }, function(error){
        
        response.error(error);
        
    })
});


Parse.Cloud.define("sendPush", function(request, response){
 
    var message = request.params.message;
    var userId = request.params.userId;
    var userFrom = request.user;
    message = userFrom.get('nome') + ": " + message
    sendPush(userId,message).then(function(success){
        console.log('push ok')
        response.success("ok push " )
    }, function(error){
        console.log(error)
        response.error(error);
        
    })
    
});

var sendPush = function(userId,message){
  
     // Create a Pointer to this user based on their object id
      var user = new Parse.User();
      user.id = userId;

    
    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo('user', user);

    // Send push notification to query
    return Parse.Push.send({
        where: pushQuery,
        //channels:['mb'],
        data: {
            alert: message,
            badge:0
        }
    }, {
        success: function() {
            console.log("Push Ok!!!")
        },
        error: function(error) {
            console.log(error)
        }
    });
}

Parse.Cloud.job("deleteCallToActionTooOld", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);

 //hh*sec*millisec
  var time = (25 * 3600 * 1000);
  var tomorrowDate = new Date(today.getTime() + time);


  var Booking = Parse.Object.extend("Booking");
  var query = new Parse.Query(Booking);
  query.greaterThanOrEqualTo("date", today);
  query.lessThanOrEqualTo("date", tomorrowDate);
  query.equalTo("callToAction", true)
  //var c = Parse.User.current().get('circolo')
  //query.equalTo('circolo',c)
  //query.include('user')
  query.include('players')
  //query.limit(30);
  //query.ascending("date");
  query.each(function(booking){
      
      console.log(booking)
      var numPlayers = booking.get("playersNumber")
      
      if ( booking.get("players").length != numPlayers ){
          var players = booking.get('players')
          _.each(players,function(p){
              sendPush(p.id,"oh oh...la tua Call To Action è stata cancellata perchè non è stato raggiunto il numero di giocatori richiesto. Sorry!")

          })
          //booking.destroy()
      }

  })
  .then(
      function() {
        // Set the job's success status
        status.success("deleteCallToActionTooOld completed successfully.");
  }, function(error) {
        // Set the job's error status
        status.error("Uh oh, something went wrong in deleteCallToActionTooOld!");
  });
});

//******************************************************************************************
