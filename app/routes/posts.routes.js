let express = require("express");
let routes = express.Router();

let upload = require("../middleware/upload.middleware");
let authentication = require("../middleware/verifyToken.middleware")
let postController = require("../controllers/post.controller")

routes.post("/posts",authentication,upload.single("image"),postController.addPost);
routes.get("/posts",authentication, postController.getAllPosts);
routes.put("/posts/:postId",authentication,upload.single("image"),postController.updatePost);
routes.put("/posts/:postId/like",authentication,postController.likePost);
routes.delete("/posts/:postId",authentication,postController.deletePost);
routes.get("/users/:id/posts/count",authentication,postController.postCounts)

module.exports = routes;
