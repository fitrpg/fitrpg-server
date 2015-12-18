"use strict";

var User = require('../user/user_model.js');
var FitbitStrategy = require('./fitbit-passport.js');
var FitbitApiClient = require('fitbit-node');
var jwt = require('jsonwebtoken');
var Q = require("q");
var utils = require('./fitbit_utility.js').util;
var fitIds = require('./fitbit_activity_ids.js');
var path = require('path');

// For processing Fitbit's push notification in the format of multipart/form (not bodyparsed :\)
var multiparty = require('multiparty');
var format = require('util').format;

var mongoose = require('mongoose');

var FITBIT_CONSUMER_KEY = process.env.FITBIT_CONSUMER_KEY;
var FITBIT_CONSUMER_SECRET = process.env.FITBIT_CONSUMER_SECRET;

var myClient = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET);

var userId;

module.exports = exports = {
  fitbitStrategy: new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: '/fitbit/authcallback'
    },
    function (token, tokenSecret, profile, done) {
      var timestamp = new Date();
      userId = profile.id; //needed to send back with the url to the client to save to local storage
      process.nextTick(function(){
        User.findByIdQ({_id: profile.id})
          .then(function (foundUser) {
            if (foundUser) {
              done(null,foundUser);
            } else {
              var currentUser = new User({
                _id: profile.id,
                createdAt: timestamp
              });
              done(null,currentUser);
              exports.subscribeUser(token,tokenSecret,userId);
              return saveInPromise(currentUser);
            }
          }).then(function() {
            // re-logging in changes the token and secret, so in any case we must update it
            // the second parameter is null because it expects a potential callback
            return exports.getAllData(userId, null, token, tokenSecret);
          }).fail(function (err) {
          }).done();
      });
  }),

  sendBrokenResponse: function (req, res, next) {
    console.log('gets to the broken response');
    res.send(200);
  },
  getTempToken: function (req, res, next) {
    //Nothing happens here because it redirects to the Fitbit site
  },

  getOauthToken: function (req, res, next) {
    var userToken = req.query['oauth_token']; //remember the user should save this, db needs do nothing with it
    var month = 43829;
    var server_token = jwt.sign({id: userId}, process.env.SECRET || "secret", { expiresInMinutes: month });
    res.redirect('?oauth_token=' + server_token + '&userId=' + userId); //this should never be viewed by the user, just ending the res, change to res.end later
  },

  subscribeUser: function(fitbitToken,fitbitSecret,id) { //subscribe this user so we get push notifications
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET);
    client.requestResource("/apiSubscriptions/"+id+".json", "POST", fitbitToken, fitbitSecret);
  },

  pushNotification: function(req,res,next) {

    var users = req.body;
    for (var j = 0; j < users.length; j++ ) {
      (function(i) {
        User.findByIdQ({_id:users[i].ownerId})
          .then(function(user) {
            user.needsUpdate = true;
            return user;
          })
          .then(function(user) {
            return saveInPromise(user);
          })
          .fail(function(err) {
            console.log(err);
          })
          .done();
      }(j));
    }
    
    res.set('Content-Type', 'application/json');
    res.send(204);
  },

  // typically, this window should never be seen and just automatically closed,
  // but in the cases where the closing window doesn't work, this provides a manual way to do itd
  finishLogin: function(req,res,next) {
    if (req.query['oauth_token'] && req.query['userId']) {
      res.sendfile(path.resolve('./static/loggedIn.html'));
    } else {
      next();
    }
  },

  retrieveData: function(req,res,next) {
    var id = req.params.id;
    exports.getAllData(id);
    res.send(200);
  },

  getAllData: function(id,cb,token,tokenSecret) {
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET);
    var dateCreated;
    User.findByIdQ({_id: id})
      .then(function(user) {
        if (token && tokenSecret) {
          user.accessToken = token;
          user.accessTokenSecret = tokenSecret;
        }
        dateCreated = user.createdAt.subtractDays(1).yyyymmdd(); // to make up for time zone mixing up, this is a buffer
        user.lastActive = user.lastActive || new Date(); //if new date this means they are a first time user
        // GET PROFILE DATA
        return client.requestResource('/profile.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          var profile = JSON.parse(results[0]);
          user.profile.avatar = profile.user.avatar;
          user.provider = 'fitbit';
          user.profile.displayName = profile.user.displayName;
          return user;
        });
      })
      .then(function(user) {
        // GET FRIEND DATA
        return client.requestResource('/friends.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          var currentFriends = user.friends;
          var friends = JSON.parse(results[0]).friends;
          var fitbitFriends = [];
          for (var i = 0; i < friends.length; i++ ) {
            fitbitFriends.push(friends[i].user.encodedId);
          }
          // get unique friends
          for (var i = 0; i<currentFriends.length;i++) {
            if (fitbitFriends.indexOf(currentFriends[i]) < 0) {
              fitbitFriends.push(currentFriends[i]);
            }
          }
          user.friends = fitbitFriends;
          return user;
        });
      })
      .then(function(user) {
        // GET ACTUAL STEPS, NOT LOGGED ONES
        return client.requestResource('/activities/tracker/steps/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          user.attributes.experience = user.attributes.experience || 0;
          user.fitbit.experience = utils.calcCumValue(JSON.parse(results[0])['activities-tracker-steps']);
          var level = utils.calcLevel(user.fitbit.experience+user.attributes.experience, user.attributes.level);
          user.attributes.skillPts = utils.calcSkillPoints(user.attributes.skillPts, level, user.attributes.level);
          user.attributes.level = level;
          return user;
        });
      })
      .then(function(user) {
        // GET SLEEP MINUTES AND CONVERT TO VITALITY
        return client.requestResource('/sleep/minutesAsleep/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          user.fitbit.vitality = utils.calcVitality(JSON.parse(results[0])['sleep-minutesAsleep']);
          return user;
        });
      })
      // GET DISTANCE AND CONVERT TO ENDURANCE
      .then(function(user) {
        return client.requestResource('/activities/tracker/distance/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          user.fitbit.endurance = utils.calcEndurance(JSON.parse(results[0])['activities-tracker-distance']);
          return user;
        });
      })
      // GET VERY ACTIVE MINUTES AND CONVERT TO ATTACK BONUS
      .then(function(user) {
        return client.requestResource('/activities/minutesVeryActive/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){
          user.fitbit.attackBonus = utils.calcAttackBonus(JSON.parse(results[0])['activities-minutesVeryActive']);
          return user;
        });
      })
      .then(function(user) {
        // GET TIME ASLEEP FROM LAST CHECK AND USE IT TO CALC SLEEP HP RECOVERY, THIS NUMBER ONLY USED ONCE
        var HPChecker = user.HPChecker;
        var today = (new Date()).yyyymmdd();
        var dateLastChecked = HPChecker.dateLastChecked || user.createdAt;
        var hpLastChecked = dateLastChecked.yyyymmdd();
        // if we didn't check yet before today, we reset foundSleep to false
        if (hpLastChecked !== today) {
          HPChecker.foundSleep = false;
        }
        // if it's true and the dates do match then we don't do anything bc we've found sleep today
        if (hpLastChecked === today && HPChecker.foundSleep === true) {
          return user;
        }
        user.HPChecker.dateLastChecked = new Date(); //set the new lastchecked date to today 
        var hpURL = '/sleep/minutesAsleep/date/'+hpLastChecked+'/today.json'; 
        return client.requestResource(hpURL,'GET',user.accessToken,user.accessTokenSecret).then(function(results){
          user.fitbit.HPRecov = utils.calcHpRecov(JSON.parse(results[0])['sleep-minutesAsleep']);
          if (user.fitbit.HPRecov > 0) {
            user.HPChecker.foundSleep = true;
          }
          return user;
        });
      })
      .then(function(user) {
        // GET WORKOUTS AND CALCULATE THEM TO BE DEXTERITY/STRENGTH
        var lastChecked = user.stringLastChecked || user.createdAt.subtractDays(1);
        var yesterday = (new Date()).subtractDays(1);
        var datesArr = getDatesArray(new Date(lastChecked),yesterday);
        if (yesterday.yyyymmdd() === lastChecked) {
          return user;
        }
        var answerPromises = [];
        var num = datesArr.length-7 > 0 ? datesArr.length-7 : 0; //only check the last 7 days
        user.stringLastChecked = datesArr[datesArr.length-1]; //this importantly sets our last checked variable
        for (var i = datesArr.length-1; i >= num; i--) {
          var a = client.requestResource('/activities/date/'+datesArr[i]+ '.json','GET',user.accessToken,user.accessTokenSecret);
          answerPromises.push(a);
        }
        return Q.all(answerPromises)
          .then(function(results) {
            var dexterity = 0;
            var strength = 0;
            for (var i = 0; i<results.length;i++) {
              dexterity += utils.calcStrDex(JSON.parse(results[i][0])['activities'] ,fitIds.dexterityIds);
              strength += utils.calcStrDex(JSON.parse(results[i][0])['activities'] ,fitIds.strengthIds);
            }
            user.fitbit.dexterity = user.fitbit.dexterity + dexterity;
            user.fitbit.strength = user.fitbit.strength + strength;
            return user;
          });
      })
      .then(function(user) {
        return saveInPromise(user);
      })
      .fail(function(err) {
        console.log(err);
      })
      .done();

    // get inactive minutes - we do nothing with this right now
    // client.requestResource('/activities/minutesSedentary/date/'+date+'/today.json','GET',fitbitToken,fitbitSecret).then(function(results){
    //   User.findById(id,function(err,user) {
    //     if (err) {throw err};
    //     user.fitbit.inactiveMinutes = JSON.parse(results[0])['activities-minutesSedentary'];
    //     user.save();
    //   });
    // });

  },

  getActivitiesDateRange: function(req,res,next) {
    var client    = myClient;
    var id        = req.params.id;
    var type      = req.params.type; //will be 'sleep' or 'activities'
    var activity  = req.params.activity;
    var startDate = req.params.startDate;
    var endDate   = req.params.endDate;
    var qString   = type + '-' + activity;
    var url = '/' + type + '/' + activity + '/date/' + startDate + '/' + endDate + '.json';
    User.findByIdQ({_id: id})
      .then(function(user) {
        return client.requestResource(url, 'GET', user.accessToken, user.accessTokenSecret).then(function(results) {
          if (activity === 'distance') {
            var total = utils.calcDecValue(JSON.parse(results[0])[qString]);
            res.json({total:total});
          } else {
            var total = utils.calcCumValue(JSON.parse(results[0])[qString]);
            res.json({total:total});
          }
        });
      })
      .fail(function(err) {
        res.send(err);
      })
      .done();
  },

  // Possible activities are calories, steps, distance, elevation, floors
  getActivitiesTimeRange: function(req,res,next) {
    var client    = myClient;
    var id        = req.params.id;
    var activity  = req.params.activity;
    var startDate = req.params.startDate;
    var endDate   = req.params.endDate;
    var startTime = req.params.startTime;
    var endTime   = req.params.endTime;
    var qString   = 'activities-' + activity;
    var url = '/activities/' + activity + '/date/' + startDate + '/1d/15min/time/' + startTime + '/' + endTime + '.json';
    User.findByIdQ({_id: id})
      .then(function(user) {
        return client.requestResource(url, 'GET', user.accessToken, user.accessTokenSecret).then(function(results) {
          if (activity === 'distance') { //decimals!
            var total = (JSON.parse(results[0])[qString][0].value*0.62137).toFixed(2); //convert to miles
            res.json({total:total});
          } else {
            var total = JSON.parse(results[0])[qString][0].value;
            res.json({total:total});
          }
        });
      })
      .fail(function(err) {
        res.send(err);
      })
      .done();
  }
};

// Reformatting of dates to fit Fitbit preferred date format in API calls
Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

Date.prototype.addDays = function(days) {
   var dat = new Date(this.valueOf())
   dat.setDate(dat.getDate() + days);
   return dat;
}

Date.prototype.subtractDays = function(days) {
   var dat = new Date(this.valueOf())
   dat.setDate(dat.getDate() - days);
   return dat;
}

var getDatesArray = function (startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate.addDays(1);
  var stopDate = stopDate;
  while (currentDate <= stopDate) {
    var fitbitCurDate = currentDate.yyyymmdd();
    dateArray.push(fitbitCurDate);
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

 //Utility function to return a promise from save, probably move elsewhere to a utils area
 //or figure out if i can use saveQ
var saveInPromise = function (model) {
  var promise = new mongoose.Promise();
  model.save(function (err, result) {
    promise.resolve(err, result);
  });
  return promise;
}
