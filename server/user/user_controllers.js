'use strict';

var User = require('./user_model.js');
var Q    = require('q');

module.exports = exports = {
  get : function (req, res, next) {
    var $promise = Q.nbind(User.findById, User);
    $promise(req.params.id)
      .then(function (users) {
        res.json(users);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getUsers : function (req, res, next) {
    var $promise = Q.nbind(User.find, User);
    $promise()
      .then(function (users) {
        res.json(users);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  post : function (req, res, next) {
    var $promise = Q.nbind(User.create, User);
    $promise(req.body.user)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  },
  put : function (req, res, next) {
    var $promise = Q.nbind(User.update, User);
    $promise({ _id : req.body._id}, req.body.user)
      .then(function (numberaffected) {
        res.send(numberaffected);
      })
      .fail(function (reason) {
        next(reason);
      });
  }
};
