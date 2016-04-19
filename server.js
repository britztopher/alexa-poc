var express = require("express"),
  AlexaSkills = require("alexa-skills"),
  Tweetbot = require("./twitter/api/tweetbot"),
  tweetBot = new Tweetbot(),
  app = express(),
  port = process.env.PORT || 8081,
  alexa = new AlexaSkills({
    express: app,
    route: "/",
    applicationId: process.env.ALEXA_APP_ID || "HelloWorld"
  });

console.log("Started listening on", port)

app.use("/auth/success", function(resp){
  console.log("SUCCESS::", resp);
});

app.get("/search", function(req, res){
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
alexa.intent("Tweets", function(req, res, slots) {
  var rawCount = slots.Count || 10;
  var criteria = {
    count: parseInt(rawCount),
    q: slots.HashTag
  };

  if (isNaN(criteria.count)) {
    options.outputSpeech = "Sorry boss, I didn't hear the number of tweets, could you say that again";
    options.repromptSpeech = "could you say the number of tweets again";
    alexa.send(req, res, options);
    return;
  }

  if (!criteria.q) {
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
    if(resp.length) {
      options.outputSpeech = "Sorry boss, I couldn't find any tweets matching " + criteria.q
    }
    else {
      options.outputSpeech = "Here are the top " + criteria.count + " tweets boss, "
      resp.forEach(function(tweet) {
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
