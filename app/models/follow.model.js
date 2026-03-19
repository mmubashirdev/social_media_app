const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  followerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  followedId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
  }
})

const Follow = mongoose.model("Follow",followSchema);
module.exports = Follow;