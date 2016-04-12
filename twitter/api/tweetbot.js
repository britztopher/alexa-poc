var Twitter = require('twitter-js-client').Twitter;

//Get this data from your twitter apps dashboard
var config = {
  "consumerKey": "28E83KZRffGwFeT2mpaAgkzzH",
  "consumerSecret": process.env.TWITTER_CONSUMER_SECRET || 'notTheRightOne',
  "accessToken": process.env.TWITTER_ACCESS_KEY,
  "accessTokenSecret": process.env.TWITTER_ACCESS_SECRET,
  "callBackUrl": "/auth/success"
};

var test = function(){
  this.twitter = new Twitter(config);
};

test.prototype.getUserTimeline = function(error, success){
  this.twitter.getUserTimeline({screen_name: 'BoyCook', count: '10'}, error, success);
};
//
// twitter.getMentionsTimeline({ count: '10'}, error, success);
//
// twitter.getHomeTimeline({ count: '10'}, error, success);
//
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