"use strict";

var User = require('../user/user_model.js');
var FitbitStrategy = require('./fitbit-passport.js');
var FitbitApiClient = require('fitbit-node');
var utils = require('./fitbit_utility.js').util;
var Q = require("q");

// For processing Fitbit's push notification in the format of multipart/form (not bodyparsed :\)
var multiparty = require('multiparty');
var format = require('util').format;

var mongoose = require('mongoose');

var FITBIT_CONSUMER_KEY = process.env.FITBIT_CONSUMER_KEY;
var FITBIT_CONSUMER_SECRET = process.env.FITBIT_CONSUMER_SECRET;
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
                accessToken: token,
                accessTokenSecret: tokenSecret,
                createdAt: timestamp
              });
              done(null,currentUser);
              exports.subscribeUser(token,tokenSecret,userId);
              return saveInPromise(currentUser);
            }
          }).then(function() {
            return exports.getAllData(userId);
          }).fail(function (err) {
            console.log('Error: ',err); 
          }).done();
      }); 
  }),

  getTempToken: function (req, res, next) {
    console.log('Nothing happens here because it redirects to the Fitbit site.');
  },

  getOauthToken: function (req, res, next) {
    var userToken = req.query['oauth_token']; //remember the user should save this, db needs do nothing with it
    res.redirect('?oauth_token=' + req.query['oauth_token']+'&userId='+userId); //this should never be viewed by the user, just ending the res, change to res.end later
  },

  subscribeUser: function(fitbitToken,fitbitSecret,id) { //subscribe this user so we get push notifications
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET);
    client.requestResource("/apiSubscriptions/"+id+".json", "POST", fitbitToken, fitbitSecret);
  },

  pushNotification: function(req,res,next) {
    console.log('Receives push notification.');
    res.set('Content-Type', 'application/json');
    res.send(204);

    // work on this later to read fitbit subscription stuff
    // var form = new multiparty.Form();

    // form.on('error', next);

    // form.on('part', function(part) {
    //   console.log("PART XYX", part);
    //   //console.log(part.read());
    //   part.on('data', function(chunk) {
    //     console.log('got %d bytes of data, bitches.', chunk.length, chunk);
    //   });
    // });

    // // form.on('file', function(part, file) {
    // //   console.log("FILE YXY", part, file);
    // // });

    // form.on('close', function(){
    //   console.log('done');
    //   res.set('Content-Type', 'application/json');
    //   res.send(204);
    // });

    // form.parse(req);
  },

  retrieveData: function(req,res,next) {
    var id = req.params.id;
    console.log('id', id);
    exports.getAllData(id);
    res.send(200);
  },

  getAllData: function(id,cb) {
    var client = new FitbitApiClient(FITBIT_CONSUMER_KEY,FITBIT_CONSUMER_SECRET); 
    var dateCreated;
    User.findByIdQ({_id: id})
      .then(function(user) {
        console.log('user',user);
        dateCreated = user.createdAt.yyyymmdd();
        console.log('datecreated',dateCreated);
        user.lastActive = user.lastActive || new Date();
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
          var friends = JSON.parse(results[0]).friends;
          var friendsArr = [];
          for (var i = 0; i < friends.length; i++ ) {
            friendsArr.push(friends[i].user.encodedId);
          }
          user.friends = friendsArr;
          return user;
        });
      })
      .then(function(user) {
        // GET STEPS AND CONVERT TO EXPERIENCE/LEVEL
        return client.requestResource('/activities/steps/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){ 
          user.attributes.level = utils.calcLevel(JSON.parse(results[0])['activities-steps'], user.attributes.level);
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
        return client.requestResource('/activities/distance/date/'+dateCreated+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){ 
          user.fitbit.endurance = utils.calcEndurance(JSON.parse(results[0])['activities-distance']);
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
        // GET SLEEP EFFICIENCY FROM LAST CHECK AND USE IT TO CALC SLEEP HP RECOVERY, THIS NUMBER ONLY USED ONCE
        if (user.lastChecked && user.lastChecked !== new Date()) { 
          var lastChecked = user.lastChecked;
        } else {
          return user; // we've already checked the user's sleep today
        }
        return client.requestResource('/sleep/efficiency/date/'+lastChecked.yyyymmdd()+'/today.json','GET',user.accessToken,user.accessTokenSecret).then(function(results){ 
          user.fitbit.HPRecov = utils.calcHpRecov(JSON.parse(results[0])['sleep-efficiency']);
          return user; 
        });       
      })
      .then(function(user) {
        // GET WORKOUTS AND CALCULATE THEM TO BE DEXTERITY
        var today = new Date();
        var lastChecked = user.lastChecked || today;
        if (lastChecked === today) { return user; } //we've already checked 
        var datesArr = getDatesArray(lastChecked,today);
        var answerPromises = [];
        var num = datesArr.length-7 > 0 ? datesArr.length-7 : 0; //only check the last 7 days
        for (var i = datesArr.length-1; i >= num; i--) {
          answerPromises.push(client.requestResource('/activities/date/'+datesArr[i]+ '.json','GET',user.accessToken,user.accessTokenSecret));
        }
        return Q.all(answerPromises)
          .then(function(results) {
            var strength= 0;
            for (var i = 0; i<results.length;i++) {
              strength += utils.calcStrDex(JSON.parse(results[i][0])['activities']);
            }
            user.fitbit.dexterity = user.fitbit.dexterity + strength;
            user.lastChecked = new Date(); //this importantly sets our last checked variable
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

var getDatesArray = function (startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
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
