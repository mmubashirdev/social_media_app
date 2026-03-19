const Notification = require("../models/notification.model");

class NotificationService {
  static async createFollowNotification(toUserId, fromUserId) {
    return Notification.create({
      user: toUserId,
      fromUser: fromUserId,
      type: "follow_request",
    });
  }

  static async createLikeNotification(toUserId, fromUserId, postId) {
    return Notification.create({
      user: toUserId,
      fromUser: fromUserId,
      type: "like",
      post: postId,
    });
  }

  static async createCommentNotification(
    toUserId,
    fromUserId,
    postId,
    commentId,
  ) {
    return Notification.create({
      user: toUserId,
      fromUser: fromUserId,
      type: "comment",
      post: postId,
      comment: commentId,
    });
  }

  static async getUserNotifications(userId) {
    return Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "fromUser", select: "username" });
  }
}

module.exports = NotificationService;
