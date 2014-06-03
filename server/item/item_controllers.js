'use strict'

var Item = require('./item_model.js');
var Q    = require('q');
var url = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(Item.findById, Item);
    $promise(req.params.id)
      .then(function (item) {
        res.json(item);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getItems : function(req, res, next) {
    var $promise = Q.nbind(Item.find, Item);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (items) {
        res.json(items);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(Item.save, Item);
    $promise(req.body.item)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
