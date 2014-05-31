'use strict'

var mongoose = require('mongoose');

 var SoloSchema = new mongoose.Schema({
    _id         : String,
    description : String,
    title       : String,
    type        : String,
    items       : [],
    difficulty  : Number,
    level       : Number,
    gold        : Number,
    experience  : Number,
    vitality    : Number,
    strength    : Number,
    endurance   : Number,
    dexterity   : Number

 });

 module.exports = exports = mongoose.model('solos', SoloSchema);
