var express   = require('express'),
  AlexaSkills = require('alexa-skills'),
  app     = express(),
  port    = process.env.PORT || 3000,
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
alexa.intent('Hello', function(req, res, slots) {
 
  console.log(slots);
 
  var phrase = 'Hello World!';
  var options = {
    shouldEndSession: true,
    outputSpeech: phrase,
    card: alexa.buildCard("Card Title", phrase)
  };
 
  alexa.send(req, res, options);
});
 
/**
 * Handles Alexa session termination requests
 */
alexa.ended(function(req, res, reason) {
  console.log(reason);
});
 
app.listen(port);
