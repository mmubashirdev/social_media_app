let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let User = require("../models/users.model");

let login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(401).json({ message: "User not found" });
    }
    let validatePass = await bcrypt.compare(password, foundUser.password);
    if (!validatePass) {
      return res.status(401).json({ message: "Invalid password" });
    }
    let token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    return res.json({
      id: foundUser._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error", error: err });
  }
};
let signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    let newUser = new User({
      username: name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

let logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Logout Successful" });
};
let verify = async (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      profilePic: req.user.profilePic,
    },
  });
};
// Update user profile
let updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password } = req.body;
    let updateFields = {};
    if (username) updateFields.username = username;
    if (password) {
      const bcrypt = require("bcrypt");
      updateFields.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      updateFields.profilePic = req.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};

module.exports = { login, logout, signup, verify, updateUser };
