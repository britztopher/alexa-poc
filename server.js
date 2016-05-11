var express = require("express"),
  AlexaSkills = require("alexa-skills"),
  authorization = require('./auth/authorization'),
  handlebars = require('express-handlebars'),
  passport = require('passport'),
  Strategy = require('passport-twitter').Strategy,
  app = express(),
  port = process.env.PORT || 8081,
  alexa = new AlexaSkills({
    express: app,
    route: "/",
    applicationId: process.env.ALEXA_APP_ID || "HelloWorld"
  });

var state =
  'eyJ2ZXJzaW9uIjoxLCJpbml0VmVjdG9yIjoiUXlZTVRKdkpJNk9kVDIzV3ltT1Rpdz09IiwicGF5bG9hZCI6IklsQ1h0THNkV2lzV2NBZWtUR0hF' +
  'Z0RDMWxzT3VkZElscFIvQXR3VS9kcWhXVmwxRlQyRmpZREh6cm1BdWNzTFVST0ZsVE9Cd2c1bkxsOXFsejFsQ3RuTHFEUTNhMDh3S25QY2lWNUFQ' +
  'YmdHSk43MkRjY1RhYTFTZFhwejRNVHJjTTV3L2djbjFHaDJ0bGw5NXl4YlhiakJOaXVVcmkyRnV0QkF4OWl3SndSWUhrelhNZ1ZabkdMUWkrNldG' +
  'UENIY2k5ek9QbE96ZmtSUG5IalBXa2FLZTVFbmhPeGFsSFBsd1JPTVpGd3ExL2VJNU9sWVpqVkZ1RXdmWUtIclJYZ2FSRlF0QWZVbnFISDlJMXQv' +
  'OVZtanlVbGNRNmpuUVUra0JBbWJrbUhFbTk4RnZWT21SS2pPYnZnWGJMR0pIZzM2U0NJWFpmSjBCMVA1elFJTWRQQzJWd2Z3eCt0N24yMW1rbXNX' +
  'U1p5Tk1vaVg3RnR3K29vZnlkT0Q2eFByUFNYaWFkMDZOUE1SQjlweTVGWFJMa0x4N2lKWDlOd0NEaWdnaVNnUkV0amZ1VWoybk1PQzNuYzBsR3du' +
  'ZzVaV3pJcjNyT3JHa1hwVWtIT1hyMmpTbDFmNnJNK01pL3FmL2hYZWRRcnBBMUtmWlE5c3BaTWswanExVkNqSVRsdUY0L0c2Qks1SHR3NytjdS9u' +
  'UDFIZXN3RFord0cweG1MbnRTdG0reEJCTC9IcmVCOEdmN0IyYmQxWWdNb1BLbGpCODQzYWt6VEx4WWlzajhtOUtlMGFjeW5PbUVvT1VoSFZTazNS' +
  'bEdkQVhOZjVMb1IxMVVKMy9uTm5nVjhYRHN3Uk5pYXdydFZ3Z2Y2ZGgwZmZNZklTUWxjTXFDRVBVUVVZWU1lRmlWcWN0cDN0WnBUTUZReFlIWVRK' +
  'V0h4d2NTTGZDRHpBZDBlVjJoSW50RWxsbTgvRHM1aXFsa1pveUt0NEhtZlJWQWNEMXd1WCs4bz0ifQ';

var myToken = '';

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Setup handlebars templates and static web assets folder
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


// Authorization Routes for Account Linking
app.route('/signin')
  .get(authorization.loginForm)
  .post(authorization.login);

app.route('/finishoauth')
  .post(authorization.acesssToken);


/**
 * Handles Alexa launch request
 */
alexa.launch(function(req, res){
  var phrase = "Welcome to my app!";

  var options = {
    shouldEndSession: false,
    outputSpeech: phrase,
    reprompt: "What was that?"
  };

  alexa.send(req, res, options);
});

/**
 * Define an Alexa intent handler
 */
alexa.intent("Tweets", function(req, res, slots){
  var rawCount = slots.Count || 10;
  var criteria = {
    count: parseInt(rawCount),
    q: slots.HashTag
  };

  if(isNaN(criteria.count)){
    options.outputSpeech = "Sorry boss, I didn't hear the number of tweets, could you say that again";
    options.repromptSpeech = "could you say the number of tweets again";
    alexa.send(req, res, options);
    return;
  }

  if(!criteria.q){
    options.outputSpeech = "Sorry boss, I missed the hashtag that you're interested in, could you say that again";
    options.repromptSpeech = "could you say the hashtag to search for again";
    alexa.send(req, res, options);
    return;
  }

  var options = {
    shouldEndSession: true
  };

  tweetBot.getSearch(criteria, function(err){
    options.outputSpeech = "Dagger, got an error back " + err;
    alexa.send(req, res, options);
  }, function(resp){
    if(resp.length){
      options.outputSpeech = "Sorry boss, I couldn't find any tweets matching " + criteria.q
    }
    else{
      options.outputSpeech = "Here are the top " + criteria.count + " tweets boss, "
      resp.forEach(function(tweet){
        options.outputSpeech += tweet.text + ", ";
      });
    }
    alexa.send(req, res, options);
  });
});

/**
 * Handles Alexa session termination requests
 */
alexa.ended(function(req, res, reason){
  console.log(reason);
});

app.listen(port);
