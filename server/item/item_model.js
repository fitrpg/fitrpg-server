'use strict'

var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    _id        : String,
    name       : String,
    image      : String,
    type       : String,
    level      : Number,
    cost       : Number,
    size       : Number,
    hp         : Number,
    sellPrice  : Number,
    vitality   : Number,
    strength   : Number,
    endurance  : Number,
    dexterity  : Number,
    consumable : Boolean,
    rare       : Boolean,
    description: String
});

module.exports = exports = mongoose.model('items', ItemSchema);
