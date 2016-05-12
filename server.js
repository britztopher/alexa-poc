var express = require("express"),
  AlexaSkills = require("alexa-skills"),
  guid = require('./auth/guid'),
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

var state = '';

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
passport.serializeUser(function(profile, cb){

  console.log('Serialized USER::', profile );
  cb(null, profile);
});

passport.deserializeUser(function(obj, cb){

  console.log('DESerialized USER::', obj);
  cb(null, obj);
});

// Authorization Routes for Account Linking
app.route('/signin')
  .get(authorization.loginForm)
  .post(authorization.login);

app.route('/finishoauth')
  .post(authorization.acesssToken);

app.route('/login/twitter')
  .get(passport.authenticate('twitter'), function(req, res){console.log('REQ:::', req.query)});

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {failureRedirect: '/login'}),
  function(req, res){
    console.log('REQUEST INFO FROM AUTH CALLBACK', req.query);
    res.redirect('/finishoauth');
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
