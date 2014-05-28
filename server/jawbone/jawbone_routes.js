'use strict'

var controller = require('./jawbone_controllers.js');

module.exports = exports = function(router, passport) {
  //we do not serialize for passport again here as we
  //already did it once for fitbit, and it is the same passport

  passport.use(controller.jawboneStrategy);
  router.use('/auth', passport.authenticate('jawbone'));
  router.use('/authcallback', controller.getAccessToken);
};
