'use strict';

var bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    middle          = require('./middleware'),
    mongoose        = require('mongoose-q')(), //mongoose-q then requires mongoose
    morgan          = require('morgan'),
    methodOverride  = require('method-override'),
    session         = require('express-session');

mongoose.connect(process.env.DB_URL || 'mongodb://localhost/fitApp');
/*
 * Include all your global env variables here.
*/
module.exports = exports = function (app, express,passport, routers) {
  app.set('port', process.env.PORT || 9000);
  app.set('base url', process.env.URL || 'http://127.0.0.1');
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(bodyParser());
  app.use(middle.cors);
  app.use(session({secret: process.env.SECRET || 'secret', maxAge: 360*5}));
  /*
   * passport.initialize() middleware is required to initialize Passport.
   * Because this application uses persistent login sessions, passport.session()
   * middleware must also be used. If enabling session support, express.session()
   * must be used BEFORE passport.session() to ensure that the login is
   * restored in the correct order.
   */
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/fitbit', routers.FitbitRouter);
  app.use('/jawbone', routers.JawboneRouter);
  app.use('/users' , routers.UserRouter);
  app.use('/solos' , routers.SoloRouter);
  app.use('/groups', routers.GroupRouter);
  app.use('/pastsolos' , routers.PastSoloRouter);
  app.use('/pastgroups', routers.PastGroupRouter);
  app.use('/items', routers.ItemRouter);
  app.use('/battles', routers.BattleRouter);
  app.use('/quests', routers.QuestRouter);
  app.use(middle.logError);
  app.use(middle.handleError);
  app.use(methodOverride());

};
