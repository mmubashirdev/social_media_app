let CommentService = require("../services/comment.service");

let createComment = async (req, res) => {
  try {
    let comment = await CommentService.createComment(
      req.params.postId,
      req.user.id,
      req.body.text,
    );
    res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: err.message });
  }
};
let getPostComments = async (req, res) => {
  try {
    let allPostComments = await CommentService.getPostComments(
      req.params.postId,
    );
    res.status(200).json(allPostComments);
  } catch (err) {
    console.error("Error getting comments:", err);
    res.status(500).json({ error: err.message });
  }
};
let updateComment = async (req, res) => {
  try {
    let updatedComment = await CommentService.updateComment(
      req.params.commentId,
      req.user.id,
      req.body.text,
    );
    res.status(201).json(updatedComment);
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ error: err.message });
  }
};
let deleteComment = async (req, res) => {
  try {
    let postDeleted = await CommentService.deleteComment(
      req.params.commentId,
      req.user.id,
    );
    res.status(200).json(postDeleted);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: err.message });
  }
};

let replyToComment = async (req, res) => {
  try {
    let reply = await CommentService.replyToComment(
      req.user.id,
      req.body.postId,
      req.body.text,
      req.params.commentId
    );
    res.status(201).json(reply);
  } catch (err) {
    console.error("Error replying to comment:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  replyToComment
};
