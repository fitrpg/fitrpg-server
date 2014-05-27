'use strict';

var User = require('../user/user_model.js');
var JawboneStrategy = require('./jawbone-passport.js');

var client_id = 'ONz6lq9qyb8';
var secret = '4db8566134bb2ccab904bf6fb3c0b6fee563193b';
var callback = 'https://fitrpg.azurewebsites.net/jawbone/authcallback'

module.exports = exports = {
  getTempToken: function (req, res, next) {
    console.log('Nothing happens here because it redirects to the Jawbone site.');
  },
  getAccessToken: function (req, res, next) {
    var jawboneTempCode = req.query['code']; //this code expires in 10 minutes
    var url = Jawbone.authorizeT + '?grant_type=authorization_code&' + 'client_id=' + Jawbone.client_id + '&client_secret=' + Jawbone.secret + '&code=' + jawboneTempCode;
    request.get(url, function (err,thing,jsonObj) {
      if (err) { res.send(err)}
        jsonObj = JSON.parse(jsonObj);
        access_token = jsonObj['access_token']; //refresh token?
        // with this token we can get the user profile and if it exists, we'll get it, if not, we'll make it
        var user =  {};
        jawboneStrategy.getUserProfile(access_token, function(profile) { //async!
          user.xid = profile.xid;
          user.avatar = profile.image;
          user.displayName = profile.first + profile.last;
          user.provider =  profile.provider;
          var newUrl = '/jawbonetoken?token=' + access_token + '&userid=' + user.xid;
          res.redirect(newUrl);
        });
    });
  },
  jawboneStrategy: new JawboneStrategy({
  clientID: client_id,
  clientSecret: secret,
  callbackURL: callback
  },
  function (token, tokenSecret, profile, done) {
    done(null);
  })
};


