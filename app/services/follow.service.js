const Follow = require("../models/follow.model");
const User = require("../models/users.model");

let assertCanViewFollowData = async (targetUserId, requesterId) => {
  let targetUser = await User.findById(targetUserId).select("visibility");
  if (!targetUser) {
    throw new Error("User not found");
  }

  let isOwner =
    requesterId && requesterId.toString() === targetUserId.toString();
  if (targetUser.visibility === "private" && !isOwner) {
    const err = new Error("This account is private");
    err.status = 403;
    throw err;
  }
};

let toggleFollow = async (followerId, followedId) => {
  let alreadyFollowed = await Follow.findOne({ followerId, followedId });
  if (alreadyFollowed) {
    await Follow.deleteOne({ followerId, followedId });
    return { action: "unfollow" };
  } else {
    await Follow.create({ followerId, followedId });
    return { action: "followed" };
  }
};

let getFollowers = async (userId, requesterId) => {
  await assertCanViewFollowData(userId, requesterId);

  let followers = await Follow.find({ followedId: userId }).populate(
    "followerId",
    "username profilePic",
  );
  let totalFollowers = await Follow.countDocuments({ followedId: userId });

  return {
    totalFollowers,
    followers,
  };
};

let getFollowing = async (userId, requesterId) => {
  await assertCanViewFollowData(userId, requesterId);

  let following = await Follow.find({ followerId: userId }).populate(
    "followedId",
    "username profilePic",
  );
  let totalFollowing = await Follow.countDocuments({ followerId: userId });

  return {
    totalFollowing,
    following,
  };
};

module.exports = { toggleFollow, getFollowers, getFollowing };
