'use strict'

var Quest = require('./quest_model');
var Q    = require('q');

module.exports = exports = {
  get : function (req, res, next) {
    var $promise = Q.nbind(Quest.findById, Quest);
    $promise(req.params.id)
      .then(function (quest) {
        res.json(quest);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getQuests : function (req, res, next) {
    var $promise = Q.nbind(Quest.find, Quest);
    $promise()
      .then(function (quests) {
        res.json(quests);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  post : function (req, res, next) {
    var $promise = Q.nbind(Quest.create, Quest);
    $promise(req.body.quest)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  }
}
