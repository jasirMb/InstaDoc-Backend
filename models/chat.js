const mongoose = require('mongoose')

const chatSchema = new  mongoose.Schema({
    members: {
        type: [String],
        required: true,
      },
})
module.exports = mongoose.model("chat", chatSchema,'chat');