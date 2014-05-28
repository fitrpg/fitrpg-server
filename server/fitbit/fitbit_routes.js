'use strict'
var controller = require('./fitbit_controllers.js');

module.exports = exports = function(router, passport) {
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}, function (err, user) {
      done(err, user);
    });
  });

  passport.use(controller.fitbitStrategy);
  router.use('/auth', passport.authenticate('fitbit'));
  // for fitbit it's a twp step process and we have to do passport auth twice
  router.use('/authcallback', passport.authenticate('fitbit')); 
  router.use('/authcallback', controller.getOauthToken);
};
