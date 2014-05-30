'use strict'
var controller = require('./fitbit_controllers.js');
var User = require('../user/user_model.js');

module.exports = exports = function(router, passport) {
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findOne({_id: id}, function (err, user) {
      done(err, user); //this will throw an error in the server logs but we don't care, we don't need passport beyond this
    });
  });

  router.route('/push') //fitbit will ping this with subscriber info, when a user's info is synced
    .post(controller.pushNotification);

  passport.use(controller.fitbitStrategy);
  router.use('/auth', passport.authenticate('fitbit'));
  // for fitbit it's a twp step process and we have to do passport auth twice
  router.use('/authcallback', passport.authenticate('fitbit')); 
  router.use('/authcallback', controller.getOauthToken);

};
