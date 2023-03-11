const mongoose = require('mongoose')

const recordSchema = new  mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
      fileName : {
        type : [String],
        required : true, 
      },
      path : {
        type : [String],
        required : true,
        
      }
})
module.exports = mongoose.model("record", recordSchema,'record');