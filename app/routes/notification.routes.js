let express = require("express");
let routes = express.Router();

let NotificationController = require("../controllers/notification.controller");
let auth = require("../middleware/verifyToken.middleware");

routes.get("/notify", auth, NotificationController.getUserNotifications);

routes.post("/follow", auth, NotificationController.createFollowNotification);

routes.post("/like", auth, NotificationController.createLikeNotification);

routes.post("/comment", auth, NotificationController.createCommentNotification);

module.exports = routes;