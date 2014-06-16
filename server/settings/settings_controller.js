'use strict'

var Settings = require('./settings_model.js');
var Q     = require('q');
var url = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(Settings.findById, Settings);
    $promise(req.params.id)
      .then(function (settings) {
        res.json(settings);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getSettings : function(req, res, next) {
    var $promise = Q.nbind(Settings.findOne, Settings);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (settings) {
        res.json(settings);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(Settings.create, Settings);
    $promise(req.body)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
