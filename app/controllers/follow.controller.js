const followService = require("../services/follow.service");

const { getIO } = require("../services/socket.service");
let toggleFollow = async (req, res) => {
  try {
    const result = await followService.toggleFollow(
      req.body.followerId,
      req.body.followedId,
    );
  
    getIO().emit("followChanged", {
      followerId: req.body.followerId,
      followedId: req.body.followedId,
      action: result.action,
    });
    res.status(200).json({ action: result.action });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
let getFollowers = async (req, res) => {
  try {
    let result = await followService.getFollowers(
      req.params.userId,
      req.user.id,
    );
    res.status(200).json({
      totalFollowers: result.totalFollowers,
      followers: result.followers,
    });
  } catch (err) {
    res.status(err.status || 400).json({ err: err.message });
  }
};

let getFollowing = async (req, res) => {
  try {
    let result = await followService.getFollowing(
      req.params.userId,
      req.user.id,
    );
    console.log(result);
    res.status(200).json({
      totalFollowing: result.totalFollowing,
      following: result.following,
    });
  } catch (err) {
    res.status(err.status || 400).json({ err: err.message });
  }
};

module.exports = { toggleFollow, getFollowers, getFollowing };
