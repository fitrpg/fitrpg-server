"use strict";

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id                : String,
  accessToken        : String,
  accessTokenSecret  : String,
  lastChecked        : Date, // the last time we pulled data from fitbit or jawbone
  needsUpdate        : {type: Boolean, default: false},
  provider           : String,
  // game specific attributes, independent of fitbit
  username   : String,
  character  : String,
  createdAt  : Date,
  attributes : {
    gold       : {type: Number, default: 0},
    experience : {type: Number, default: 0},
    vitality   : {type: Number, default: 20},
    strength   : {type: Number, default: 20},
    endurance  : {type: Number, default: 20},
    dexterity  : {type: Number, default: 20},
    level      : {type: Number, default: 0},
    skillPts   : {type: Number, default: 0},
    HP         : {type: Number, default: 0}
  },
  equipped : {
    weapon1     : String,
    weapon2     : String,
    armor       : String,
    accessory1  : String,
    accessory2  : String
  },
  // fitbit and jawbone specific, calculated from data
  fitbit : {
    endurance    : {type: Number, default: 0},
    vitality     : {type: Number, default: 0},
    attackBonus  : {type: Number, default: 0},
    dexterity    : {type: Number, default: 0},
    HPRecov      : {type: Number, default:0}
  },
  jawbone : {
    sleepQuality       : String,
    workOutLog         : [],
    steps              : Number,
    sleep              : Number,
    distance           : Number,
    veryActiveMinutes  : Number,
    inactiveMinutes    : Number
  },
  friends        : [],
  inventory      : [],
  lastActive     : Date,
  missionsVersus : [],
  missionsSolo   : [],
  profile        : {
    displayName  : String,
    avatar       : String
  }

});

module.exports = exports = mongoose.model('user', UserSchema);
