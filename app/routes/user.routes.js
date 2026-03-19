const express = require("express");
const routes = express.Router();
const upload = require("../middleware/upload.middleware");

const authController = require("../controllers/auth.controller");
const authentication = require("../middleware/verifyToken.middleware");

routes.post("/signup", authController.signup);
routes.post("/login", authController.login);
routes.post("/logout", authController.logout);
routes.get("/verify-auth", authentication, authController.verify);

routes.put(
  "/users/:id",
  authentication,
  upload.single("profilePic"),
  authController.updateUser,
);

module.exports = routes;
