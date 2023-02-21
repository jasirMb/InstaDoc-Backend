const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  otp  :{
    type :String
  },
  verified : {
    type : Boolean,
    default : false
  },
  access : {
    type : Boolean,
    default : true
  }
});

module.exports = mongoose.model("user", userSchema,'user');