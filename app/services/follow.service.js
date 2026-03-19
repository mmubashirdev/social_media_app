const Follow = require("../models/follow.model");

let toggleFollow = async (followerId, followedId)=>{
  let alreadyFollowed = await Follow.findOne({followerId,followedId});
  if(alreadyFollowed){
    await Follow.deleteOne({followerId,followedId});
    return {action:"unfollow"};
  }else{
    await Follow.create({followerId,followedId});
    return {action:"followed"};
  }
}

let getFollowers = async (userId)=>{
  let followers = await Follow.find({followedId:userId}).populate("followerId","username profilePic");
  let totalFollowers = await Follow.countDocuments({followedId:userId});
  return {
    totalFollowers,
    followers
  }
}


let getFollowing = async (userId)=>{
  let following = await Follow.find({followerId:userId}).populate("followedId","username profilePic");
  let totalFollowing = await Follow.countDocuments({followerId:userId});
  return {
    totalFollowing,
    following
  }
}

module.exports = {toggleFollow,getFollowers,getFollowing};