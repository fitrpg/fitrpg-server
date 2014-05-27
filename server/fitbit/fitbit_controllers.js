"use strict";

var User = require('../user/user_model.js');
var FitbitStrategy = require('./fitbit-passport.js');

var FITBIT_CONSUMER_KEY = '8cda22173ee44a5bba066322ccd5ed34';
var FITBIT_CONSUMER_SECRET = '12beae92a6da44bab17335de09843bc4';

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
  fitbitStrategy: new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: "/fitbit/authcallback"
  },
    function (token, tokenSecret, profile, done) {
      done(null);
    })
};
