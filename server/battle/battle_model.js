'use strict'

var mongoose = require('mongoose');

var BattleSchema = new mongoose.Schema({
 winner    : String,
 loser     : String,
 createdAt : Date
});

module.exports = exports = mongoose.model('battles', BattleSchema);
