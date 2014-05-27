'use strict';

var User = require('../user/user_model.js');
var JawboneStrategy = require('./jawbone-passport.js');

var client_id = 'ONz6lq9qyb8';
var secret = '4db8566134bb2ccab904bf6fb3c0b6fee563193b';
var callback = 'https://fitrpg.azurewebsites.net/jawbone/authcallback'

module.exports = exports = {
  getTempToken: function (req, res, next) {
    console.log('maybe');
  },
  getOauthToken: function (req, res, next) {
    var userToken = req.query['oauth_token']; //save this token to the DB and get the user info and save that too
    //then redirect with the token AND the user id and then make sure the client checks for
    // that and saves both things
    console.log("TEST",req.query); //token is here, do stuff with it
    res.send(200,JSON.stringify({'thing':[]}));
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


