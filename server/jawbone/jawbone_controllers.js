'use strict';

var request = require('request');
var User = require('../user/user_model.js');
var JawboneStrategy = require('./jawbone-passport.js');
var JawboneUp = require('jawbone-up');

var authorizeTokenLink = 'https://jawbone.com/auth/oauth2/token';
var client_id = process.env.JAWBONE_CLIENT_ID || 'asda';
var secret = process.env.JAWBONE_SECRET || 'asdas';
var callback = 'https://fitrpg.azurewebsites.net/jawbone/authcallback';

module.exports = exports = {
  jawboneStrategy: new JawboneStrategy({
    clientID: client_id,
    clientSecret: secret,
    callbackURL: callback
  },
  function (token, tokenSecret, profile, done) {
    done(null);
  }),

  getTempToken: function (req, res, next) {
    //Nothing happens here because it redirects to the Jawbone site.
  },

  getAccessToken: function (req, res, next) {
    var jawboneTempCode = req.query['code']; //this code expires in 10 minutes
    var url = authorizeTokenLink + '?grant_type=authorization_code&' + 'client_id=' + client_id + '&client_secret=' + secret + '&code=' + jawboneTempCode;
    request.get(url, function (err,thing,jsonObj) {
      if (err) { res.send(err)}
        jsonObj = JSON.parse(jsonObj);
        var access_token = jsonObj['access_token']; //refresh token?
        // with this token we can get the user profile and if it exists, we'll get it, if not, we'll make it
        var user =  {};
        exports.jawboneStrategy.getUserProfile(access_token, function(profile) { //async!
          user.xid = profile.xid;
          user.profile.avatar = profile.image;
          user.profile.displayName = profile.first + profile.last;
          user.provider =  profile.provider;
          user.accessToken = accessToken;
          var newUrl = '/jawbonetoken?token=' + access_token + '&userid=' + user.xid;
          res.redirect(newUrl); //this url will never actually go anywhere, we are just sending it back to the client
        });
    });
  },
  // where to put this function...
  getAllData: function(accessToken) {
    var options = {
      access_token: accessToken
    };
    var up = JawboneUp(options);
    up.friends.get({}, function(){
      //save user friends
    });
    up.moves.get({}, function() {

    });
    up.workouts.get({}, function() {

    });

  }

};
