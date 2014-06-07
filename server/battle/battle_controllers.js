'use strict'

var Battle = require('./battle_model.js');
var Q     = require('q');
var url = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(Battle.findById, Battle);
    $promise(req.params.id)
      .then(function (battle) {
        res.json(battle);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getBattles : function(req, res, next) {
    var $promise = Q.nbind(Battle.find, Battle);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (battles) {
        res.json(battles);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(Battle.create, Battle);
    console.log('here');
    console.log(req.body);
    console.log(req.body.battle);
    $promise(req.body)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
