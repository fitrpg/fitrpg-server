'use strict'

var controller = require('./user_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.getUsers)
    .post(controller.post)
    .put(controller.put);

  router.route('/:id')
    .get(controller.get);

  // sends a query to the database to see if this username exists
  router.route('/check/:username')
    .get(controller.checkUsername);
      
};
