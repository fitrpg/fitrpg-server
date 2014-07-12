'use strict';

var User = require('./user_model.js');
var Q    = require('q');
var url  = require('url');

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
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
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
        res.json(user);
      })
      .fail(function (reason) {
        next(reason);
      });
  },
  getRandom: function(req,res,next) {
    var id = req.params.id;
    var level = req.params.level;
    var lowerLimit = req.params.level-2 >= 1 ? req.params.level-2 : 1;
    var upperLimit = req.params.level+2;
    var $promise  = Q.nbind(User.find, User);
    $promise({ _id: {'$ne': id}, 'attributes.level': {'$lte' : upperLimit , '$gte' : lowerLimit} } )
      .then(function(users) {
        var randomUser = users[Math.floor(Math.random()*users.length)];
        res.json(randomUser);
      })    
      .fail(function (reason) {
        next(reason);
      })
  },
  // getLeaderboard: function(req,res,next) {
  //   var $promise = Q.nbind(User.find,User);
  //   $promise({ $query: {}, $orderby: { 'attributes.level' : -1 } })
  //     .then(function(users) {
  //       res.json(users.slice(0,100));
  //     })
  //     .fail(function (reason) {
  //       next(reason);
  //     })a
  // },
  getLeaderboard: function(req,res,next) {
    res.json([]);
  },
  searchUsername: function(req,res,next) {
    var searchQuery = new RegExp(req.params.username, 'i');
    var $promise = Q.nbind(User.find, User);
    $promise({ username: { $regex: searchQuery } })
      .then(function(users) {
        res.json(users);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
};

