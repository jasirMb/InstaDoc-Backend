const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  specialization : {
    type: String,
    unique: false,
    required: true,
  },
  gender : {
    type : String,
    required: true,
  },
  city : {
    type :String,
    required : true
  },
  experience : {
    type : Number

  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  approved: {
    type: Boolean,
    default:false
    
  },
  doctorId : {
    type : Number,
    required:true
  },
  access: {
    type: Boolean,
    default:true
    
  },
});

module.exports = mongoose.model("doctor", doctorSchema,'doctor');