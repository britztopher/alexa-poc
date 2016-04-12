var express   = require('express'),
  AlexaSkills = require('alexa-skills'),
  Tweetbot = require('./twitter/api/tweetbot'),
  app     = express(),
  port    = process.env.PORT || 8081,
  alexa = new AlexaSkills({
    express: app,
    route: "/",
    applicationId: process.env.ALEXA_APP_ID || "HelloWorld"
  });

console.log("Started listening on", port)

/**
 * Handles Alexa launch request
 */ 
alexa.launch(function(req, res) {
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
alexa.intent('Tweets', function(req, res, slots) {

  var tweetBot = new Tweetbot();

  var options = {
    shouldEndSession: true,
    card: alexa.buildCard("Card Title", this.phrase)
  };

  tweetBot.getUserTimeline(function(err){
    options.phrase = 'got error back';
    alexa.send(req, res, options);
  }, function(resp){

    options.phrase = 'got '+resp.length+' tweets back ' + resp[0].text;
    alexa.send(req, res, options);
  });

});
 
/**
 * Handles Alexa session termination requests
 */
alexa.ended(function(req, res, reason) {
  console.log(reason);
});
 
app.listen(port);
