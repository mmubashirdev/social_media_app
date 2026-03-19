let express = require("express");
let routes = express.Router();

let commentController = require("../controllers/comment.controller");
let auth = require("../middleware/verifyToken.middleware")

routes.post("/posts/:postId/comments",auth,commentController.createComment);
routes.get("/posts/:postId/comments", auth, commentController.getPostComments);
routes.put("/comments/:commentId", auth, commentController.updateComment);
routes.delete("/comments/:commentId",auth,commentController.deleteComment);
routes.post("/comments/:commentId/reply",auth,commentController.replyToComment)

module.exports = routes;