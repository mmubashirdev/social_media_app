const Follow = require("../models/follow.model");
let Posts = require("../models/posts.model");
let Likes = require("../models/likes.model");
let User = require("../models/users.model");
const { getIO } = require("../services/socket.service");

async function addPost(title, caption, img, tags, author, userId) {
  let post = await Posts.create({
    title,
    caption,
    img,
    tags,
    author,
    user: userId,
  });
  return post;
}

const mongoose = require("mongoose");
async function getAllPosts(userId) {
  if (!userId) {
    throw new Error("Missing userId parameter");
  }

  let allPosts;
  try {
    allPosts = await Posts.find()
      .populate("user", "username profilePic visibility")
      .sort({ createdAt: -1 });
  } catch (dbErr) {
    console.error("❌ Service DEBUG: Posts.find failed:", dbErr);
    throw dbErr;
  }
  console.log("📊 Service DEBUG: Found", allPosts.length, "posts");

  let postsWithLikes = [];

  for (let i = 0; i < allPosts.length; i++) {
    let post = allPosts[i];

    console.log(
      `🔍 Service DEBUG [post ${i}]: ID=${post._id}, user=${post.user?._id}`,
    );

    let postOwner = post.user;
    let isPrivate = postOwner?.visibility === "private";
    let postUserId = postOwner?._id?.toString();

    let canView = true;
    if (isPrivate && postUserId && userId.toString() !== postUserId) {
      canView = false;
    }

    if (!canView) {
      console.log(`🚫 Skip private post ${post._id}`);
      continue;
    }

    let likesCount = await Likes.countDocuments({ post: post._id });
    let isLiked = false;
    let isFollowing = false;
    if (userId) {
      try {
        let likeExists = await Likes.exists({
          post: post._id,
          user: new mongoose.Types.ObjectId(userId),
        });
        isLiked = !!likeExists;
      } catch (likeErr) {
        console.error(`❌ Likes error [post ${post._id}]:`, likeErr.message);
      }

      if (postUserId && postUserId !== userId.toString()) {
        try {
          const mongooseUserId = new mongoose.Types.ObjectId(userId);
          const mongoosePostUserId = new mongoose.Types.ObjectId(postUserId);
          let followExists = await Follow.exists({
            followerId: mongooseUserId,
            followedId: mongoosePostUserId,
          });
          isFollowing = !!followExists;
        } catch (followErr) {
          console.error(
            `Follow error [post ${post._id}]:`,
            followErr.message,
          );
        }
      }
    }
    let postData = post.toObject();
    
    if (postData.tags && typeof postData.tags === "string") {
      postData.tags = postData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (!Array.isArray(postData.tags)) {
      postData.tags = [];
    }
    postData.likesCount = likesCount;
    postData.isLiked = isLiked;
    postData.isFollowing = isFollowing;
    postsWithLikes.push(postData);
  }

  console.log("Posts with likes info:", postsWithLikes);
  return postsWithLikes;
}

async function updatePost(postId, userId, title, caption, img, tags) {
  let post = await Posts.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  if (!post.user.equals(userId)) {
    throw new Error("Cannot edit this post");
  }
  post.title = title;
  post.caption = caption;
  if (img) {
    post.img = img;
  }
  post.tags = tags;

  await post.save();
  return post;
}

async function deletePost(postId, userId) {
  let post = await Posts.findById(postId);
  if (!post) {
    throw new Error("Error deleting post");
  }
  if (!post.user.equals(userId)) {
    throw new Error("Unauthorized");
  }
  await Posts.findByIdAndDelete(postId);
  return { message: "Post Deleted Successfully" };
}

async function toggleLikes(postId, userId) {
  let post = await Posts.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  let liked = await Likes.findOne({
    post: postId,
    user: userId,
  });

  let isLiked;
  if (liked) {
    await Likes.deleteOne({ _id: liked._id });
    isLiked = false;
  } else {
    await Likes.create({
      post: postId,
      user: userId,
    });
    isLiked = true;
    
    const NotificationService = require("./notification.service");
    const postWithUser = await Posts.findById(postId).populate("user");
    if (
      postWithUser &&
      postWithUser.user &&
      userId.toString() !== postWithUser.user._id.toString()
    ) {
      await NotificationService.createLikeNotification(
        postWithUser.user._id,
        userId,
        postId,
      );
    }
  }
  let totalLikes = await Likes.countDocuments({ post: postId });

  const io = getIO();
  io.emit("postLiked", {
    postId,
    userId,
    totalLikes,
    isLiked,
  });
  return { totalLikes, isLiked };
}

let postCounts = async (targetUserId, requesterId) => {
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

  let totalPosts = await Posts.countDocuments({ user: targetUserId });
  return totalPosts;
};

module.exports = {
  addPost,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLikes,
  postCounts,
};
