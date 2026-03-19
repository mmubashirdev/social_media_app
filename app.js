const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./app/routes/user.routes");
const postRoutes = require("./app/routes/posts.routes");
const commentRoutes = require("./app/routes/comment.routes");
const followRoutes = require("./app/routes/follow.routes");
const connectDB = require("./config/db");
const { socketSetup } = require("./app/services/socket.service");
const notificationRoutes = require("./app/routes/notification.routes");
require("dotenv").config();
const app = express();

const server = http.createServer(app);
socketSetup(server);

connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", userRoutes);
app.use("/", postRoutes);
app.use("/", commentRoutes);
app.use("/", followRoutes);
app.use("/", notificationRoutes);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`http://localhost:${port}/login.html`);
});
