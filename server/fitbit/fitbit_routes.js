'use strict'
var FitbitStrategy = require('./fitbit-passport.js');
var controller = require('./fitbit_controllers.js');

module.exports = exports = function(router, passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.originalId);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({originalId: id}, function (err, user) {
      done(err, user);
    });
  });

  passport.use(controller.fitbitStrategy);

  router.use('/auth', passport.authenticate('fitbit'));
  router.use('/authcallback', controller.getOauthToken);
};
