const chatController = require("../controllers/chat.controller");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/verifyToken.middleware");

router.get("/messages/:user1/:user2", auth, chatController.getMessage);
router.get("/messages/unread-counts", auth, chatController.getUnreadCounts);
router.patch(
  "/messages/read/:senderId",
  auth,
  chatController.markConversationRead,
);

router.post("/messages", auth, chatController.sendMessage);

module.exports = router;
