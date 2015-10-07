
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world from your Parse Server....!");
  console.log('log server...');
});

Parse.Cloud.define("modifyUser", function(request, response){
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.User);
  query.get(request.params.objectId, {
        success: function(user) {
          // The object was retrieved successfully.
          user.set('enabled',true)
          user.save()
          .then(
            function(u){
              response.success(user)
          }, function(error){
              response.error(error);
          })


        },
        error: function(object, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and message.
          response.error(error);
        }
  });
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

  console.log('CaptchaCode:');
  console.log(request.params.captchaResponse);

  var platform = request.params.platform;

  if (platform != 'ios' && platform != 'android'){
      var googleParams = "secret=6Le_Kg0TAAAAACpZHdJjXwy_eXA6aLasfrfOavNr&response=" +  request.params.captchaResponse

      Parse.Cloud.httpRequest({
            url: 'https://www.google.com/recaptcha/api/siteverify?' + googleParams
        })
        .then(
          function(httpResponse){
            console.log('Verifica Captcha ok!!!!');
            console.log(httpResponse.text);
            if ( httpResponse.text.success == 'false'){
              response.error("Verifica Captcha non superata....");

            }
        }, function(httpResponse){
          console.log('Verifica Captcha NOT ok!!!');
            console.log(httpResponse);
            response.error("Uh oh, something went wrong verifyng Captcha...");
        })
  }


  user.signUp(null, {
    success: function(user) {
      response.success(user);
      var Mailgun = require('mailgun');
      Mailgun.initialize('sandboxb318624be69540219e6c0e4769735e6b.mailgun.org', 'key-c88b7957c124942a3a24311f0970f929');
      Mailgun.sendEmail({
              to: "corrado.graziotti@hotmail.it",
              from: "Mailgun@CloudCode.com",
              subject: "Iscrizione Utente",
              text: "L'utente " + request.params.username + " ha richiesto l'Iscrizione a Magic Paddle. "
            }, {
              success: function(httpResponse) {
                console.log(httpResponse);
                //response.success("Email sent!");
              },
              error: function(httpResponse) {
                console.error(httpResponse);
                response.error("Uh oh, something went wrong sending email");
              }
            });

    },
    error: function(user, error) {
      response.error(error);
    }
  });
});
