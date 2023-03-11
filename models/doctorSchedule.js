const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
  },
  date : {
    type : String,
    required : true, 
  },
  time : {
    type : String,
    required : true,
    
  }

});
module.exports = mongoose.model("Schedule",doctorScheduleSchema)