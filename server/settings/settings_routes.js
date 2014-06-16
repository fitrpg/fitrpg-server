'use strict'

var controller = require('./settings_controller.js');

module.exports = exports = function(router) {
  router.route('/')
    .get(controller.getSettings)
    .post(controller.post);

  router.route('/:id')
    .get(controller.get);
}
