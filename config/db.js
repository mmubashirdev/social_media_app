const { MongoNetworkError } = require("mongodb");
const mongoose = require("mongoose");

let connectDB = async()=>{
  try{
    let conn = await  mongoose.connect(process.env.MONGO_URI)
    console.log("Mongo Connected successfully")
  }catch(err){
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;