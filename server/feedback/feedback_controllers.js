'use strict'

var Feedback = require('./feedback_model.js');
var Q     = require('q');
var url = require('url');

module.exports = exports = {
  get : function(req, res, next) {
    var $promise = Q.nbind(Feedback.findById, Feedback);
    $promise(req.params.id)
      .then(function (feedback) {
        res.json(feedback);
      })
      .fail(function (reason) {
        next(reason);
      })
  },
  getFeedback : function(req, res, next) {
    var $promise = Q.nbind(Feedback.find, Feedback);
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    $promise(query)
      .then(function (feedbacks) {
        res.json(feedbacks);
      })
      .fail(function (reason){
        next(reason);
      })
  },
  post : function(req, res, next) {
    var $promise = Q.nbind(Feedback.create, Feedback);
    console.log(req.body);
    console.log(req.body.params);
    $promise(req.body)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      })
  }
}
