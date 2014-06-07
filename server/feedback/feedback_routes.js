'use strict'

var controller = require('./feedback_controllers.js');

module.exports = exports = function(router) {
  router.route('/')
    .get(controller.getFeedback)
    .post(controller.post);

  router.route('/:id')
    .get(controller.get);
}
