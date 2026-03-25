const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  visibility:{
    type: String,
    enum: ['public', 'private'],
    default: "public"
  }
});

module.exports = mongoose.model("User", userSchema);
