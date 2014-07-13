'use strict'
var controller = require('./fitbit_controllers.js');
var User = require('../user/user_model.js');
module.exports = exports = function(router, passport) {

  // see if we can set this elsewhere
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}, function (err, user) {
      done(err, user); //this will throw an error in the server logs but we don't care, we don't need passport beyond this
    });
  });

  router.route('/push')
    .post(controller.pushNotification);

  /* Will later have to move the following route once we have jawbone data as well */
  router.route('/refresh/:id')
    .get(controller.retrieveData);

  router.route('/daterange/:id/:type/:activity/:startDate/:endDate')
    .get(controller.getActivitiesDateRange);

  
  /* WORKING ROUTE FOR QUESTS THROUGH MIDNIGHT */
  router.route('/new/timerange/:id/:activity/:startDate/:startTime/:endTime')
    .get(controller.getActivitiesTimeRange);

  /* BACKWARDS COMPATIBLE - KEEPING THIS ROUTE */
  router.route('/timerange/:id/:activity/:startDate/:endDate/:startTime/:endTime')
    .get(controller.getActivitiesTimeRange);

  /* This is the route that catches post log in, which is usually closed automatically, 
     but sometimes it doesn't close so we have a button to close. We also want to  */  
  router.route('/authcallback')
    .get(controller.finishLogin);

  passport.use(controller.fitbitStrategy);
  router.use('/auth', passport.authenticate('fitbit'));

  // for fitbit it's a twp step process and we have to do passport auth twice
  router.use('/authcallback', passport.authenticate('fitbit'));
  router.use('/authcallback', controller.getOauthToken);


 
};