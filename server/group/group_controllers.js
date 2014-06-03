'use strict'

var Group = require('./group_model.js');
var Q     = require('q');
var url   = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(Group.findById, Group);
    $promise(req.params.id)
      .then(function (group) {
        res.json(group);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getGroups : function(req, res, next) {
    var $promise = Q.nbind(Group.find, Group);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (groups) {
        res.json(groups);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(Group.save, Group);
    $promise(req.body.group)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
