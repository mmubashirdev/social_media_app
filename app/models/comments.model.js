const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  post:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Post"
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  text:{
    type:String,
    required:true
  },
  parentComment:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Comment",
    default:null
  }
}, { timestamps: true })

module.exports = mongoose.model("Comment",commentSchema);