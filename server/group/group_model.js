'use strict'

var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
  _id         : String,
  title       : String,
  description : String,
  bet         : Number,
  attributes  : {
   gold       : Number,
   experience : Number,
   vitality   : Number,
   strength   : Number,
   endurance  : Number,
   dexterity  : Number
 }

});

module.exports = exports = mongoose.model('groups', GroupSchema);
