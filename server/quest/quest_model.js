'use strict'

var mongoose = require('mongoose');

 var QuestSchema = new mongoose.Schema({
    _id                :  String,
    title              :  String,
    shortDescription   :  String,
    longDescription    :  String,
    numDays            :  Number,
    numHours           :  Number,
    gold               :  Number,
    winGoals           :  Number,
    experienceG        :  Number,
    difficulty         :  Number,
    type               :  String,
    activity           :  String
 });

 module.exports = exports = mongoose.model('quests', QuestSchema);
