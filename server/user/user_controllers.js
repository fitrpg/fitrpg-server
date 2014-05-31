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
    $promise(req.body)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  },
  put : function (req, res, next) {
    var id = req.body._id;
    // not allowed update the _id
    delete req.body._id;
    var $promise = Q.nbind(User.update, User);
    $promise({ _id : id}, req.body)
      .then(function (numberaffected) {
        res.send(numberaffected);
      })
      .fail(function (reason) {
        next(reason);
      });
  },

  checkUsername: function(req,res,next) {
    var $promise = Q.nbind(User.findOne, User);
    $promise({username:req.params.username})
      .then(function(user) { //this means the username exists for a user
        console.log('user');
        console.log(user);
        if(user) {
          res.send('User exists.');
        } else {
          res.send(req.params.username);
        }
      })
      .fail(function (reason) {
        res.end(req.params.username);
      });
  }
};
