const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref : 'doctor'
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref : 'user'
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
