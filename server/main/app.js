'use strict';

var cookieParser = require('cookie-parser');
var express      = require('express');
var request      = require('request');
var passport     = require('passport');
var app          = express();

var UserRouter      = express.Router();
var SoloRouter      = express.Router();
var QuestRouter     = express.Router();
var GroupRouter     = express.Router();
var ItemRouter      = express.Router();
var BattleRouter    = express.Router();
var PastGroupRouter = express.Router();
var PastSoloRouter  = express.Router();
var FitbitRouter    = express.Router();
var JawboneRouter   = express.Router();
var FeedbackRouter  = express.Router();
var SettingsRouter  = express.Router();
var routers         = {};

routers.BattleRouter     = BattleRouter;
routers.UserRouter       = UserRouter;
routers.SoloRouter       = SoloRouter;
routers.QuestRouter      = QuestRouter;
routers.GroupRouter      = GroupRouter;
routers.ItemRouter       = ItemRouter;
routers.PastGroupRouter  = PastGroupRouter;
routers.PastSoloRouter   = PastSoloRouter;
routers.JawboneRouter    = JawboneRouter;
routers.FitbitRouter     = FitbitRouter;
routers.FeedbackRouter   = FeedbackRouter;
routers.SettingsRouter   = SettingsRouter;

require('./config.js')(app, express, passport, routers);
require('../user/user_routes.js')(UserRouter);
require('../solo/solo_routes.js')(SoloRouter);
require('../quest/quest_routes.js')(QuestRouter);
require('../group/group_routes.js')(GroupRouter);
require('../item/item_routes.js')(ItemRouter);
require('../battle/battle_routes.js')(BattleRouter);
require('../pastSolo/past_solo_routes.js')(PastSoloRouter);
require('../pastGroup/past_group_routes.js')(PastGroupRouter);
require('../fitbit/fitbit_routes.js')(FitbitRouter, passport); // investigate how to not to pass in passport twice
require('../jawbone/jawbone_routes.js')(JawboneRouter, passport);
require('../feedback/feedback_routes.js')(FeedbackRouter);
require('../settings/settings_routes.js')(SettingsRouter);

module.exports = exports = app;
