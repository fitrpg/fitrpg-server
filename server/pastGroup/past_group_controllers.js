'use strict'

var PastGroup = require('./past_group_model.js');
var Q         = require('q');
var url       = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(PastGroup.findById, PastGroup);
    $promise(req.params.id)
      .then(function (pastGroup) {
        res.json(pastGroup);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getPastGroups : function(req, res, next) {
    var $promise = Q.nbind(PastGroup.find, PastGroup);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (pastGroups) {
        res.json(pastGroups);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(PastGroup.save, PastGroup);
    $promise(req.body.pastGroup)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
