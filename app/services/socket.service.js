const { Server } = require("socket.io");
let io;

function socketSetup(server) {
  io = new Server(server);
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("register", (userId) => {
      if (!userId) return;
      socket.join(userId.toString());
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
}

function emitToUser(userId, eventName, payload) {
  if (!io || !userId) return;
  io.to(userId.toString()).emit(eventName, payload);
}

function getIO() {
  return io;
}

module.exports = {
  socketSetup,
  getIO,
  emitToUser,
};
