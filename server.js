var express = require("express"),
  AlexaSkills = require("alexa-skills"),
  authorization = require('./auth/authorization'),
  handlebars = require('express-handlebars'),
  TwitterAuth = require('./auth/twitterAuth'),
  Tweetbot = require('./twitter/api/tweetbot'),
  app = express(),
  port = process.env.PORT || 8081,
  alexa = new AlexaSkills({
    express: app,
    route: "/",
    applicationId: process.env.ALEXA_APP_ID || "HelloWorld"
  });

var state = '';

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Setup handlebars templates and static web assets folder
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
   
var twitterAuth = new TwitterAuth(app);

app.route('/awsRedirect')
  .get(authorization.awsRedirect);

app.route('/login')
  .get(function(req, res){
    state = req.query.state;

    res.redirect('/login/twitter');
  });

/**
 * Handles Alexa launch request
 */
alexa.launch(function(req, res){
  var phrase = "What would you like Tweetbot to do?";

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
  var options = {};
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

alexa.intent("TimeLine", function(req, res, slots){

  
  var accessToken = req.body.session.user.accessToken;
  var tweetBot = new Tweetbot(accessToken);

  tweetBot.getHomeTimeline(criteria, function(err){
    options.outputSpeech = "Dagger, got an error back " + err;
    alexa.send(req, res, options);
  }, function(resp){
    if(resp.length){
      options.outputSpeech = "Sorry boss, I couldn't find any tweets matching " + criteria.q
    }
    else{
      options.outputSpeech = "Here are your last 10 tweets on your timeline boss cheif";
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
