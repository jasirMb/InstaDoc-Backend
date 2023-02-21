const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
    
  },
  time : {
    type : String,
    required: true,
  },
  fee : {
    type : Number,
    required: true,
  },
  paymentStatus : {
    type : String,
   
  },
  status : {
    type : String,
    required: true,
  },
});

module.exports = mongoose.model(
  "appointment",
  appointmentSchema,
  "appointment"
);
