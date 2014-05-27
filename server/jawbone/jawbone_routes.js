'use strict'

var controller = require('./jawbone_controllers.js');

module.exports = exports = function(router, passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.originalId);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({originalId: id}, function (err, user) {
      done(err, user);
    });
  });

  passport.use(controller.jawboneStrategy);
  router.use('/auth', passport.authenticate('jawbone'));
  router.use('/authcallback', controller.getAccessToken);
};
