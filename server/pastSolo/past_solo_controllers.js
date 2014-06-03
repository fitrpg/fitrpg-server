'use strict'

var PastSolo = require('./past_solo_model');
var Q        = require('q');
var url      = require('url');

module.exports = exports = {
  get : function (req, res, next) {
    var $promise = Q.nbind(PastSolo.findById, PastSolo);
    $promise(req.params.id)
      .then(function (pastSolo) {
        res.json(pastSolo);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getPastSolos : function (req, res, next) {
    var $promise = Q.nbind(PastSolo.find, PastSolo);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (pastSolos) {
        res.json(pastSolos);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  post : function (req, res, next) {
    var $promise = Q.nbind(PastSolo.create, PastSolo);
    $promise(req.body.pastSolo)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  }
}
