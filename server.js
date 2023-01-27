const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require("mongoose");

const app = express()


require('dotenv').config();

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
