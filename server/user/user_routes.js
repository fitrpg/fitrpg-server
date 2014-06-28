'use strict'

var controller = require('./user_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.getUsers)
    .post(controller.post)
    .put(controller.put);

  // get the top 100 users
  router.route('/leaderboard')
  	.get(controller.getLeaderboard);

  router.route('/:id')
    .get(controller.get);

  // sends a query to the database to see if this username exists
  router.route('/check/:username')
    .get(controller.checkUsername);

  // randomly gets a user that is within 2 levels of current user
  router.route('/random/:id/:level')
  	.get(controller.getRandom);
  
  // search query through a regular expression
  router.route('/search/:username')
    .get(controller.searchUsername);
};
