const chatService = require("../services/chat.service");
const { emitToUser } = require("../services/socket.service");

let getMessage = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    if (req.user.id.toString() !== user1 && req.user.id.toString() !== user2) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const messages = await chatService.getMessages(user1, user2);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

let sendMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !text || !text.trim()) {
      return res
        .status(400)
        .json({ error: "receiverId and text are required" });
    }

    let newMessage = await chatService.sendMessage(
      senderId,
      receiverId,
      text.trim(),
    );

    const unreadCount = await chatService.getUnreadCountFromSender(
      receiverId,
      senderId,
    );

    emitToUser(receiverId, "chat:unread-update", {
      senderId: senderId.toString(),
      unreadCount,
    });

    res.status(201).json({
      message: "Message sent",
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

let getUnreadCounts = async (req, res) => {
  try {
    const counts = await chatService.getUnreadCountsBySender(req.user.id);
    res.json({ counts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread counts" });
  }
};

let markConversationRead = async (req, res) => {
  try {
    const receiverId = req.user.id;
    const { senderId } = req.params;

    await chatService.markConversationAsRead(receiverId, senderId);

    emitToUser(receiverId, "chat:unread-update", {
      senderId: senderId.toString(),
      unreadCount: 0,
    });

    res.json({ message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
};

module.exports = {
  getMessage,
  sendMessage,
  getUnreadCounts,
  markConversationRead,
};
