'use strict'

var mongoose = require('mongoose');

var SettingsSchema = new mongoose.Schema({
 platform     : String,
 incentive    : Boolean,
});

module.exports = exports = mongoose.model('settings', SettingsSchema);
