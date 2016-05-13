var Twitter = require('twitter-node-client').Twitter;

//Get this data from your twitter apps dashboard
var config = {
  "consumerKey": "YxwdMDq5ky7ZNLKcijYK7r9ud",
  "consumerSecret": process.env.TWITTER_CONSUMER_SECRET || 'notTheRightOne',
  // "accessToken": process.env.TWITTER_ACCESS_TOKEN,
  "accessTokenSecret": process.env.TWITTER_ACCESS_SECRET
};

var test = function(userAccessToken){

  config.accessToken = userAccessToken;
  this.twitter = new Twitter(config);
};

test.prototype.getUserTimeline = function(error, success){
  this.twitter.getUserTimeline({screen_name: 'copperpott', count: '2'}, error,  success);
};

test.prototype.getSearch = function(criteria, err, success){
  console.log("Searching for criteria ==> ", criteria);
  this.twitter.getSearch(criteria, err, success);
};

test.prototype.getHomeTimeline = function(err, success){
  this.twitter.getHomeTimeline({ count: '10'}, err, success);
};

function error(err){
  console.log('Error in TweetBot::', err);
}



//
// twitter.getMentionsTimeline({ count: '10'}, error, success);

// twitter.getReTweetsOfMe({ count: '10'}, error, success);
//
// twitter.getTweet({ id: '1111111111'}, error, success);


//
// Get 10 tweets containing the hashtag haiku
//

// twitter.getSearch({'q': '#haiku', 'count': 10}, error, success);

//
// Get 10 popular tweets with a positive attitude about a movie that is not scary
//

// twitter.getSearch({'q': ' movie -scary :) since:2013-12-27', 'count': 10, 'result\_type': 'popular'}, error, success);

module.exports = test;
