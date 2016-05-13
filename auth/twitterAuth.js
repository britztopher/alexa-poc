var passport = require('passport'),
  Strategy = require('passport-twitter').Strategy;

var TwitterAuth = function(app){

  this.app = app;

  var myToken = '';
  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

passport.use(new Strategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
   callbackURL: "http://127.0.0.1:18081/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, cb){
    // In this example, the user's Twitter profile is supplied as the user
    // record.  In a production-quality application, the Twitter profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    
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
    cb(null, profile);
  });
  
  passport.deserializeUser(function(obj, cb){
    cb(null, obj);
  });

  app.route('/login/twitter')
    .get(passport.authenticate('twitter'));
 
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {failureRedirect: '/login'}),
    function(req, res){
      res.redirect('/awsRedirect?state='+state+'&access_token='+myToken);
    });
  
};



module.exports = TwitterAuth;
