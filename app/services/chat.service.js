const mongoose = require("mongoose");
let Message = require("../models/chat.model");
let User = require("../models/users.model");

let getMessages = async (user1, user2) => {
  let messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort({ createdAt: 1 });

  return messages;
};

let sendMessage = async (senderId, receiverId, text) => {
  let receiver = await User.findById(receiverId).select("_id");
  if (!receiver) {
    throw new Error("Receiver not found");
  }

  let newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    text,
  });
  return newMessage;
};

let getUnreadCountFromSender = async (receiverId, senderId) => {
  return Message.countDocuments({
    receiver: receiverId,
    sender: senderId,
    readAt: null,
  });
};

let getUnreadCountsBySender = async (receiverId) => {
  const grouped = await Message.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(receiverId),
        readAt: null,
      },
    },
    {
      $group: {
        _id: "$sender",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {};
  grouped.forEach((row) => {
    counts[row._id.toString()] = row.count;
  });

  return counts;
};

let markConversationAsRead = async (receiverId, senderId) => {
  return Message.updateMany(
    {
      receiver: receiverId,
      sender: senderId,
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    },
  );
};

module.exports = {
  getMessages,
  sendMessage,
  getUnreadCountFromSender,
  getUnreadCountsBySender,
  markConversationAsRead,
};
