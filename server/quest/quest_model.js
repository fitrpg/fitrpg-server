'use strict'

var mongoose = require('mongoose');

 var QuestSchema = new mongoose.Schema({
    _id         :  String,
    numDays     :  Number,
    description :  String,
    title       :  String,
    gold        :  Number,
    winGoals    :  [],
    experienceG :  Number,

 });

 module.exports = exports = mongoose.model('quests', QuestSchema);
