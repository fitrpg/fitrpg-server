"use strict";

var User = require('../user/user_model.js');
var FitbitStrategy = require('./fitbit-passport.js');
var FitbitApiClient = require('fitbit-node');

var FITBIT_CONSUMER_KEY = '8cda22173ee44a5bba066322ccd5ed34';
var FITBIT_CONSUMER_SECRET = '12beae92a6da44bab17335de09843bc4';
var fitbitId, fitbitToken, fitbitSecret;

module.exports = exports = {
  fitbitStrategy: new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: '/fitbit/authcallback'
    },
    function (token, tokenSecret, profile, done) {   
      var timestamp = new Date();
      process.nextTick(function(){
        User.findOne({_id: profile.id, provider: profile.provider}, function(err,foundUser) {
          if(foundUser) { 
            foundUser.lastActive = timestamp;
            foundUser.save(function(err, savedUser) {done(null, savedUser);});
          } else {
            var newUser = new User({
              _id: profile.id,
              accessToken: token,
              accessTokenSecret: tokenSecret,
              createdAt: timestamp
            });
            newUser.save(function(err,savedUser) {
              done(null,savedUser); //save basic user and do done() to redirect the page
            });
          }
        });
      }); 
      exports.getAllData(token,tokenSecret,profile.id,timestamp); //get data in the background      
  }),

  getTempToken: function (req, res, next) {
    console.log('Nothing happens here because it redirects to the Fitbit site.');
  },

  getOauthToken: function (req, res, next) {
    var userToken = req.query['oauth_token']; //remember the user should save this, db needs do nothing with it
    res.send(200,JSON.stringify({'End':[]})); //this should never be viewed by the user, just ending the res, change to res.end later
  },

  subscribeUser: function(fitbitToken,fitbitSecret,id) { //subscribe this user so we get push notifications
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET);
    client.requestResource("/apiSubscriptions/"+id+".json", "POST", fitbitToken, fitbitSecret);
  },

  pushNotification: function(req,res,next) {
    console.log(JSON.stringify(req.body)); // this should have our subscriber data, do something with it, ie save to db that update is needed
    res.set('Content-Type', 'application/json');
    res.send(204);
  },

  getAllData: function(fitbitToken,fitbitSecret,id,date) {
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET); 
    date = date.yyyymmdd();
    // get profile data
    client.requestResource('/profile.json','GET',fitbitToken,fitbitSecret).then(function(results){
      User.findById(id,function(err,user) {
        if (err) {throw err}
        var profile = JSON.parse(results[0]);
        user.avatar = profile.user.avatar;
        user.provider = 'fitbit';
        user.save();
      });
    });

    // get steps data, and add it to our old steps data...math logic
    client.requestResource('/activities/steps/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.steps = JSON.parse(results[0])['activities-steps'][0].value;
        user.save();
      });
    });

    // get sleep minutes 
    client.requestResource('/sleep/minutesAsleep/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.sleep = JSON.parse(results[0])['sleep-minutesAsleep'][0].value;
        user.save();
      });
    });

    // get sleep efficiency
    client.requestResource('/sleep/efficiency/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.sleepQuality = JSON.parse(results[0])['sleep-efficiency'][0].value;
        user.save();
      });
    });

    // get very active minutes
    client.requestResource('/activities/minutesVeryActive/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.veryActiveMinutes = JSON.parse(results[0])['activities-minutesVeryActive'][0].value;
        user.save();
      });
    });

    // get inactive minutes
    client.requestResource('/activities/minutesSedentary/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.inactiveMinutes = JSON.parse(results[0])['activities-minutesSedentary'][0].value;
        user.save();
      });
    });

    // get logged workouts
    client.requestResource('/activities/date/'+date+'.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        user.fitbit.workOutLog = JSON.parse(results[0])['activities']; //just long thing of activities for that one day-idk about time series
        user.save();
      });
    });

    // get the friends
    client.requestResource('/friends.json','GET',fitbitToken,fitbitSecret).then(function(results){ 
      User.findById(id,function(err,user) {
        if (err) {throw err};
        var friends = JSON.parse(results[0]).friends;
        var friendsArr = [];
        for (var i = 0; i < friends.length; i++ ) {
          friendsArr.push(friends[i].user.encodedId);
        }
        user.friends = friendsArr;
        user.save();
      });
    });
  }
};

// Reformatting of dates to fit Fitbit preferred date format in API calls
Date.prototype.yyyymmdd = function() {         
  var yyyy = this.getFullYear().toString();                                    
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
  var dd  = this.getDate().toString();                                  
  return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};  
