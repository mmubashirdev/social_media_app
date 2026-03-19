const express  = require("express");
const router = express.Router();

const followController = require("../controllers/follow.controller");
const authentication = require("../middleware/verifyToken.middleware");

router.post("/toggle",authentication,followController.toggleFollow);
router.get("/follower/:userId",authentication,followController.getFollowers);
router.get("/following/:userId",authentication,followController.getFollowing);

module.exports = router;