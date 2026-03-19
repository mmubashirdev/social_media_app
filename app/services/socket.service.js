const {Server} = require("socket.io");
let   io;

function socketSetup(server){
  io = new Server(server);
  io.on("connection",(socket)=>{
    console.log("User connected ",socket.id);
    socket.on("disconnect",()=>{
      console.log("User disconnected ",socket.id)
    })
  })
}

function getIO(){
  return io;
}

module.exports = {
  socketSetup,
  getIO
}