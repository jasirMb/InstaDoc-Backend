const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "chat",
  },
  senderId : {
    type : String,
    required : true,
  },
  recieverId : {
    type : String,
    required : true,
  },
  messages : {
    type : String

  }
});
module.exports = mongoose.model("messages", messageSchema, "messages");
