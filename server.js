var express = require('express'),
  AlexaSkills = require('alexa-skills'),
  Tweetbot = require('./twitter/api/tweetbot'),
  tweetBot = new Tweetbot(),
  app = express(),
  port = process.env.PORT || 8081,
  alexa = new AlexaSkills({
    express: app,
    route: "/",
    applicationId: process.env.ALEXA_APP_ID || "HelloWorld"
  });

console.log("Started listening on", port)

app.use('/auth/success', function(resp){
  console.log('SUCCESS::', resp);
});

// app.use('/', function(req, res){
//
//   var options = {
//     shouldEndSession: true
//   };
//
//   tweetBot.getUserTimeline(function(err){
//     res.status(400).send(err);
//   }, function(resp){
//     res.status(200).send(resp)
//   })
// });

app.get('/search', function(req, res){
  tweetBot.getSearch(
    function(err){
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
alexa.intent('Tweets', function(req, res, slots){
  
  var options = {
    shouldEndSession: true
  };
  
  tweetBot.getUserTimeline(function(err){
    options.outputSpeech = 'got error back' + err;
    alexa.send(req, res, options);
  }, function(resp){
    
    options.outputSpeech = 'got ' + resp.length + ' tweets back ' + resp[0].text;
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
