'use strict'

var mongoose = require('mongoose');

var FeedbackSchema = new mongoose.Schema({
 email     : String,
 message   : String,
 createdAt : Date
});

module.exports = exports = mongoose.model('feedback', FeedbackSchema);
