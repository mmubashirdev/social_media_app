let services = require("../services/post.service");

const { getIO } = require("../services/socket.service");
let addPost = async (req, res) => {
  try {
    let post = await services.addPost(
      req.body.title,
      req.body.caption,
      req.file ? req.file.filename : null,
      req.body.tags,
      req.user.username,
      req.user.id,
    );
    // Emit real-time new post event
    getIO().emit("newPost", { post });
    res.status(201).json({ message: "Post created successfully", post });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

let getAllPosts = async (req, res) => {
  try {
    console.log(
      "📄 Controller DEBUG: getAllPosts called - req.user.id:",
      req.user.id,
      "Type:",
      typeof req.user.id,
    );
    if (!req.user?.id) {
      return res.status(401).json({ error: "Missing user ID - unauthorized" });
    }
    let allPosts = await services.getAllPosts(req.user.id);
    console.log(
      "✅ Controller DEBUG: Service returned",
      allPosts?.length || 0,
      "posts",
    );
    res.status(200).json(allPosts);
  } catch (err) {
    console.error("❌ Controller DEBUG: getAllPosts error:", err.message);
    console.error("❌ Full error:", err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};

let updatePost = async (req, res) => {
  try {
    let updatedPost = await services.updatePost(
      req.params.postId,
      req.user.id,
      req.body.title,
      req.body.caption,
      req.file ? req.file.filename : null,
      req.body.tags,
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

let deletePost = async (req, res) => {
  try {
    await services.deletePost(req.params.postId, req.user.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(400).send("Error: ", err);
  }
};
let likePost = async (req, res) => {
  try {
    let result = await services.toggleLikes(req.params.postId, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).send(err);
  }
};
let postCounts = async (req, res) => {
  try {
    let result = await services.postCounts(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};
module.exports = {
  addPost,
  getAllPosts,
  updatePost,
  deletePost,
  likePost,
  postCounts,
};
