var guid = require('./guid');
var state = '';

var Authorization = {
  
  loginForm: function(req, res){
    
    state = req.query.state;
    
    res.render('login', {amazonState: state});

  },
  
  login: function(req, res){

    console.log('reqBODY', req.body);
    var authToken = guid.generateGuid();

    res.render('accessToken', {amazonState: req.query.state, accessToken: authToken})
  },

  acesssToken: function(req, res){
    var accessToken = req.body.t || guid.generateGuid();
    
    console.log('ACCESSTOKEN in /finishOauth::',accessToken );
    console.log('REQ in /finishOauth::', req.query);

    var redirectUri = "https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=M28J2SR508CPU9" +
      "#access_token=" + accessToken + "&token_type=Bearer&state=" + req.query.state;
    console.log('REDIRECT URI:: ',  redirectUri);
    
    res.redirect(redirectUri);
  }
};

module.exports = Authorization;