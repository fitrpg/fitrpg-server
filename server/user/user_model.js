"use strict";

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id                : String,
  accessToken        : String,
  accessTokenSecret  : String,
  stringLastChecked  : String,
  friendRequests     : [],
  lastChecked        : Date, // the last time we pulled data from fitbit or jawbone
  needsUpdate        : {type: Boolean, default: false},
  provider           : String,
  // game specific attributes, independent of fitbit
  username   : String,
  character  : String,
  characterClass : String,
  createdAt  : Date,
  attributes : {
    gold       : {type: Number, default: 200},
    experience : {type: Number, default: 0},
    vitality   : {type: Number, default: 20},
    strength   : {type: Number, default: 20},
    endurance  : {type: Number, default: 20},
    dexterity  : {type: Number, default: 20},
    level      : {type: Number, default: 0},
    skillPts   : {type: Number, default: 0},
    HP         : {type: Number, default: 500}
  },
  equipped : {
    weapon1 : {
      inventoryId: Number,
      name: String
    },
    weapon2 : {
      inventoryId: Number,
      name: String
    },
    armor : {
      inventoryId: Number,
      name: String
    },
    accessory1 : {
      inventoryId: Number,
      name: String
    },
    accessory2 : {
      inventoryId: Number,
      name: String
    }
  },
  // fitbit and jawbone specific, calculated from data
  fitbit : {
    endurance    : {type: Number, default: 0},
    vitality     : {type: Number, default: 0},
    attackBonus  : {type: Number, default: 0},
    dexterity    : {type: Number, default: 0},
    strength     : {type: Number, default: 0},
    HPRecov      : {type: Number, default:0},
    experience   : {type: Number, default:0}
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
  battles        : [],
  quests         : [],
  profile        : {
    displayName  : String,
    avatar       : String
  },
  HPChecker      : {
    dateLastChecked: Date,
    foundSleep     : {type: Boolean, default: false} 
  }

});

module.exports = exports = mongoose.model('user', UserSchema);