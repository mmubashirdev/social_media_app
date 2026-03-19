const NotificationService = require("../services/notification.service");

class NotificationController {

  static async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const notifications = await NotificationService.getUserNotifications(userId);
      res.status(200).json({ notifications });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }


  static async createFollowNotification(req, res) {
    try {
      const { toUserId } = req.body;
      const fromUserId = req.user._id;
      const notification = await NotificationService.createFollowNotification(toUserId, fromUserId);
      res.status(201).json({ notification });
    } catch (err) {
      res.status(500).json({ error: "Failed to create follow notification" });
    }
  }


  static async createLikeNotification(req, res) {
    try {
      const { toUserId, postId } = req.body;
      const fromUserId = req.user._id;
      const notification = await NotificationService.createLikeNotification(toUserId, fromUserId, postId);
      res.status(201).json({ notification });
    } catch (err) {
      res.status(500).json({ error: "Failed to create like notification" });
    }
  }
  static async createCommentNotification(req, res) {
    try {
      const { toUserId, postId, commentId } = req.body;
      const fromUserId = req.user._id;
      const notification = await NotificationService.createCommentNotification(toUserId, fromUserId, postId, commentId);
      res.status(201).json({ notification });
    } catch (err) {
      res.status(500).json({ error: "Failed to create comment notification" });
    }
  }
}
module.exports = NotificationController;
