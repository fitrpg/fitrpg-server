'use strict'

var controller = require('./quest_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.getQuests)
    .post(controller.post);

  router.route('/:id')
    .get(controller.get)
}
