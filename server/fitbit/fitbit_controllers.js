"use strict";

var oauthSignature = require('oauth-signature');
var User = require('../user/user_model.js');
var FitbitStrategy = require('./fitbit-passport.js');
var Q = require('q');
var OAuth = require('oauth').OAuth;
var request = require('request');

var FITBIT_CONSUMER_KEY = '8cda22173ee44a5bba066322ccd5ed34';
var FITBIT_CONSUMER_SECRET = '12beae92a6da44bab17335de09843bc4';

module.exports = exports = {

  fitbitStrategy: new FitbitStrategy({
      consumerKey: FITBIT_CONSUMER_KEY,
      consumerSecret: FITBIT_CONSUMER_SECRET,
      callbackURL: "/fitbit/authcallback"
    },
    function (token, tokenSecret, profile, done) {
      process.nextTick(function () {
        User.findOne({
          _id: profile.id,
          provider: profile.provider
        }, function (err, foundUser) {
          if (foundUser) {
            console.log('user found');
            done(null, foundUser);
          } else {

            // TESTING HERE. i want to make a request to fitbit using these params to generate a signature because oauth doesn't work

            var parameters = {
              oauth_consumer_key: '8cda22173ee44a5bba066322ccd5ed34',
              oauth_token: token,
              oauth_nonce: 'kllo9940pd9333jh',
              oauth_timestamp: '1401241426',
              oauth_signature_method: 'HMAC-SHA1',
              oauth_version: '1.0',
            }

            var signature = oauthSignature.generate('GET', 'https://api.fitbit.com/oauth/request_token', parameters, FITBIT_CONSUMER_SECRET, tokenSecret);
            console.log('sig', signature);

            var options = {
              url: 'https://api.fitbit.com/1/user/-/profile.json',
              headers: {
                'Authorization': 'OAuth oauth_consumer_key="8cda22173ee44a5bba066322ccd5ed34",' +
                  'oauth_token="' + token + '",' +
                  'oauth_signature_method="HMAC-SHA1",' +
                  'oauth_timestamp="1401247297",' +
                  'oauth_nonce="515379974",' +
                  'oauth_version="1.0",' +
                  'oauth_signature="' + signature + '"'
              }
            };

            console.log(options);

            var callback = function (error, response, body) {
              console.log('a', error, response, body);
            }

            request(options, callback);
            //test


            // var api_url = 'https://api.fitbit.com/1/user/2Q5X8W/profile.json';
            //     var sigBaseStringParams = "oauth_consumer_key=" + FITBIT_CONSUMER_KEY ;
            //     sigBaseStringParams += "&oauth_nonce=" + 'GTEydy';
            //     sigBaseStringParams += "&oauth_signature_method=HMAC-SHA1";
            //     sigBaseStringParams += "&oauth_timestamp=" + '1401243761';
            //     sigBaseStringParams += "&oauth_token=" + token;
            //     sigBaseStringParams += "&oauth_version=1.0";


            // var sigBaseString = "GET&";
            // sigBaseString += encodeURIComponent(api_url) + "&" + encodeURIComponent(sigBaseStringParams);

            // base string we should be making
            //GET&http%3A%2F%2Fapi.fitbit.com%2F1%2Fuser%2F-%2Factivities%2Fdate%2F2010-04-02.json&oauth_consumer_key%3Dfitbit-example-client-application%26oauth_nonce%3D515379974%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1270248088%26oauth_token%3D8d3221fb072f31b5ef1b3bcfc5d8a27a%26oauth_version%3D1.0

            console.log("ORIGINAL:", token, tokenSecret);
            var newUser = new User({
              _id: profile.id,
              provider: profile.provider,
              displayName: profile.displayName,
              accessToken: token,
              accessTokenSecret: tokenSecret,
              createdAt: Date.now()
            });
            var newClient = new FitbitAPIClient(FITBIT_CONSUMER_KEY, FITBIT_CONSUMER_SECRET);
            // console.log('newclient',newClient);
            fetchAllFitbitData(newClient, newUser, function (modifiedUser) {
              modifiedUser.save(function (err, savedUser) {
                if (err) {
                  throw err
                }
                console.log(modifiedUser);
                done(null, modifiedUser);
                //fitbitGet.subscribeUser(savedUser.originalId, function() {
                // done(null, savedUser);
                //});
              });
            });
          }
        });
      });
    }),

  getTempToken: function (req, res, next) {
    console.log('Nothing happens here because it redirects to the Fitbit site.');
  },

  getOauthToken: function (req, res, next) {
    var userToken = req.query['oauth_token']; //save this token to the DB and get the user info and save that too

    //then redirect with the token AND the user id and then make sure the client checks for
    // that and saves both things
    // this is where we save the user data and check against the db and stuff
    res.send(200, JSON.stringify({
      'Oauth Token Function': []
    })); //this should never be viewed by the user, just ending the res
  }

};


// Fitbit OAuth
var FitbitAPIClient = function (consumerKey, consumerSecret) {
  this.oauth = new OAuth(
    'https://api.fitbit.com/oauth/request_token', //fitbit req token
    'https://api.fitbit.com/oauth/access_token', //fitbit access token
    FITBIT_CONSUMER_KEY,
    FITBIT_CONSUMER_SECRET,
    '1.0', //current api version.
    'http://fitrpg.azurewebsites.net/fitbit/authcallback',
    'HMAC-SHA1'
  );
};

FitbitAPIClient.prototype = {

  requestResource: function (path, method, user) {
    // console.log('test',this._signature);
    var url = "https://api.fitbit.com/1/user/" + '-' + path;
    console.log(url);
    var deferred = Q.defer();
    console.log("NEXT", user.accessToken, user.accessTokenSecret);
    this.oauth.getProtectedResource(url, method, user.accessToken, user.accessTokenSecret, deferred.makeNodeResolver());
    return deferred.promise;
  }

};

var fetchAllFitbitData = function (FitbitClient, user, cb) {
  var date = user.createdAt.yyyymmdd();
  console.log("Client");
  console.log(FitbitClient);
  FitbitClient.requestResource("/profile.json", "GET", user)
    .then(function (results) {
      var obj = JSON.parse(results[0]).user;
      user.profile.displayName = obj.profile.displayName;
      user.profile.avatar = obj.profile.avatar;
      console.log(user);
      cb(user);
    });

  // //get sedentarymins
  //   fitbitly.fitbitClient.requestResource("/activities/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
  //   .then(function (results) {
  //     var activities = JSON.parse(results[0]);
  //     req.user.sedentaryMins = activities.summary.sedentaryMinutes;
  //     req.user.veryActiveMins = activities.summary.veryActiveMinutes;
  //     req.user.fairlyActiveMins = activities.summary.fairlyActiveMinutes;
  //     req.user.lightlyActiveMins = activities.summary.lightlyActiveMinutes;
  //     req.user.steps = activities.summary.steps;
  //     req.user.calories = activities.summary.caloriesOut; //not 100% sure if this is accurate representation of calories
  //   });

  // //get sleep
  // fitbitly.fitbitClient.requestResource("/sleep/date/"+date+".json", "GET", fitbitly.token, fitbitly.tokenSecret)
  //   .then(function (results) {
  //     req.user.sleep = results[0];
  //   });

  //   //get badges -- no date!
  // fitbitly.fitbitClient.requestResource("/badges.json", "GET", fitbitly.token, fitbitly.tokenSecret)
  //   .then(function (results) {
  //     var badges = JSON.parse(results[0]).badges;
  //     badgeArray = [];
  //     for (var i = 0; i<badges.length;i++ ) {
  //       badgeArray.push({"badgeType":badges[i].badgeType,
  //                "timesAchieved": badges[i].timesAchieved,
  //                "value": badges[i].value,
  //                "dateTime": badges[i].dateTime
  //               });
  //     }
  //     req.user.badges = badgeArray;
  //   });

  //   //get friends and also create models for each one if they exist, if they don't then store them!
  //   fitbitly.fitbitClient.requestResource("/friends.json", "GET", fitbitly.token, fitbitly.tokenSecret)
  //   .then(function (results) {
  //     var friends = JSON.parse(results[0]).friends;
  //     var friendsArr = [];
  //     for (var i = 0; i < friends.length; i++ ) {
  //       friendsArr.push(friends[i].user.encodedId);
  //     }

  //     req.user.friends = friendsArr;
  //     console.log('friends', req.user.friends);
  //     console.log('original id', req.user.originalId);
  //     User.findOne({originalId: req.user.originalId}, function(err,foundUser) {
  //       foundUser.friends = req.user.friends;
  //       foundUser.steps = req.user.steps;
  //       foundUser.calories = req.user.calories;
  //       foundUser.badges = req.user.badges;
  //       foundUser.sedentarymins = req.user.sedentarymins;
  //       foundUser.veryActiveMins = req.user.veryActiveMins;
  //       foundUser.fairlyActiveMins = req.user.fairlyActiveMins;
  //       foundUser.lightlyActiveMins = req.user.lightlyActiveMins;
  //       foundUser.prof = req.user.prof;
  //       foundUser.save(function(err,saved) {
  //         res.sendfile(__dirname + '/public/client/templates/index.html');

  //       });
  //     });

  //   });

}

// Date conversion to switch from date.now to yyyymmdd format which is what fitbit requires
Date.prototype.yyyymmdd = function () {

  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based         
  var dd = this.getDate().toString();
  return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);

};

// var UserSchema = new mongoose.Schema({
//   _id : String,
//   attributes : {
//     gold : Number,
//     experience : Number,
//     vitality : Number,
//     strength : Number,
//     enduarance : Number,
//     dexterity : Number
//   },
//   character : String,
//   createdAt : Date,
//   fitbit : {
//     steps : Number,
//     sleep : Number,
//     sleepQuality : String,
//     veryActiveMinutes : Number,
//     inactiveMinutes : Number,
//     workOutLog : []
//   },
//   jawbone : {
//     steps : Number,
//     sleep : Number,
//     sleepQuality : String,
//     veryActiveMinutes : Number,
//     inactiveMinutes : Number,
//     workOutLog : []
//   },
//   friends: [],
//   inventory: [],
//   lastActive : Date,
//   missionsVersus : [],
//   missionsSolo : [],
//   profile : {
//     displayName : String,
//     avatar : String
//   },
//   provider : String,
//   username: String,

// });