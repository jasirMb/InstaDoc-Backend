const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require("mongoose");
const session = require('express-session')
const stripe = require('stripe')('sk_test_51McR2MSACriAWWdeBjDXkW9S6TZx07NvcxZUORdV8GWtAa7IgkJM5Jvlib0CaGtLi0OEDeYp23gKtwbCiu9nqyt1006ukl4A89')
const app = express()


require('dotenv').config();
app.use(session({ secret: "Key", cookie: { maxAge: 60000 * 60 } }))
app.use(bodyParser.json())

let corsOption = {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  };
app.use(cors(corsOption))
app.listen(process.env.PORT,function(){
    console.log('server running'+process.env.PORT);
})
// mongooose setup
mongoose.connect(process.env.CONNECTION_STRING).then(() => {
    
    console.log("Database Connnected");
})
mongoose.set('strictQuery', true);
// route paths
const userRouter = require("./routes/user.js");
const doctorRouter = require("./routes/doctor.js");
const adminRouter = require("./routes/admin.js");
// middlewares for routes
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/doctor", doctorRouter);

module.exports = app;
