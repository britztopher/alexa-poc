var express = require("express"),
  AlexaSkills = require("alexa-skills"),
  Tweetbot = require("./twitter/api/tweetbot"),
  tweetBot = new Tweetbot(),
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


passport.use(new Strategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "https://www.uwannarace.com/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, cb){
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.

    console.log('TOKEN::', token);
    console.log('TOKEN_SECRET::', tokenSecret);

    myToken = token;

    return cb(null, profile);
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb){
  cb(null, user);
});

passport.deserializeUser(function(obj, cb){
  cb(null, obj);
});

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/login'}),
  function(req, res){
    console.log('REQUEST INFO FROM AUTH CALLBACK', req.query + '\n', req.body);
    res.redirect('https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=M28J2SR508CPU9&state='
      +state+'&access_token='+myToken+'&token_type=Bearer');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', {user: req.user});
  });

console.log("Started listening on", port)

app.get("/search", function(req, res){
  tweetBot.getSearch({
    q: req.query.q
  }, function(err){
    res.status(400).send(err);
  }, function(resp){
    res.status(200).send(resp)
  })
});

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
