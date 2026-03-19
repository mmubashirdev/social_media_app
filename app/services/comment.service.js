let Comment = require("../models/comments.model");
let Post = require("../models/posts.model");
let {getIO}  = require("../services/socket.service");



class CommentService {
  static async createComment(postId, userId, text) {
    let post = await Post.findById(postId);
    if (!post) {
      throw new Error("This post is no longer Available");
    }

    let comment = await Comment.create({
      post: postId,
      user: userId,
      text,
    });

    let io = getIO();
    io.to(postId).emit("newComment", {
      post: postId,
      user: userId,
      text,
    });
    return comment;
  }

  static async getPostComments(postId) {
    try {
      let comments = await Comment.find({ post: postId })
        .populate("user", "username profilePic")
        .sort({ createdAt: 1 })
        .lean();

      return comments;
    } catch (err) {
      console.error("Error in getPostComments:", err);
      throw err;
    }
  }

  static async updateComment(commentId, userId, txt) {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("This comment no longer exists");
    }
    if (!comment.user.equals(userId)) {
      throw new Error("Unauthorized");
    }
    comment.text = txt;
    await comment.save();
    return comment;
  }

  static async deleteComment(commentId, userId) {
    let comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("Comment is no longer available");
    }
    if (!comment.user.equals(userId)) {
      throw new Error("Unauthorized");
    }
    await Comment.findByIdAndDelete(commentId);
    return { message: "Comment Deleted Successfully" };
  }
  static async replyToComment(userId, postId, text, parentCommentId) {
    let parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new Error("Parent comment not found");
    }
    if (!parentComment.post.equals(postId)) {
      throw new Error("Parent comment does not belong to this post");
    }
    let reply = await Comment.create({
      user: userId,
      post: postId,
      text,
      parentComment: parentCommentId
    });
    return reply;
  }
}

module.exports = CommentService;
