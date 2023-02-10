const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user.js");
const nodemailer = require("nodemailer")

module.exports = {
  postRegister: async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    // validating inputs
    if (!(email && password && username
        )) {
      res.status(400).send("All input is required");
    }
    // checking if user already exist?
    console.log(email);
    const existUser = await userSchema.findOne({email});
    console.log(email)
    if (existUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    // ...................... setting otp..............................//
    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    // ......................seting up node mailaer.................//
    let mailTransporter = nodemailer.createTransport({
      service : "gmail",
      tls: {
        rejectUnauthorized: false
      },
      auth : {
        user : "jasirmbmb9118@gmail.com",
        pass : process.env.EMAIL_AUTH
      }
    }) 
    let details = {
      from : "jasirmbmb9118@gmail.com",
      to : email,
      subject : "OTP FOR REGISTRASTION",
      text : "your OTP for Registering INSTADOC :"+otp
    }
    mailTransporter.sendMail(details,(err)=> {
      if(err){
        console.log("errorrooro",(err));
      }else{
        console.log("mail has been sended");
      }
    })
    // ......................setup finsished........................//
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await userSchema.create({
      username,
      email: email.toLowerCase(),
      password : encryptedPassword,
      otp,
    });
    user.save((error, registeredUser) => {
      if (error) {
        console.log(error);
      } else {
      let  username = user.username
        const token = jwt.sign(
            { user_id: user._id},
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
        res.status(200).json({token});
      }
    });
    console.log(req.session.otp+"last" );
  },
  postLogin: async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    console.log(email + "heyyyyyyy");
    const user = await userSchema.findOne({ email: email });
    console.log(user);
    if (user) {
      console.log("user here");
      if ((await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
            { user_id: user._id, type: "user" },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
        res.status(200).json(token);
      } else {
        res.status(401).send("invalid password");
      }
    } else {
      console.log("user not here");
      res.status(401).send("user not exist");
    }
  },
  otpVerify :async (req,res) => {
    data = req.body.data
    token = req.body.token
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser['user_id']
    console.log(decodedUser);
    let enteredOtp = data.otp1 + data.otp2 + data.otp3 + data.otp4;
    console.log(enteredOtp);
    const user = await userSchema.findOne({ _id : userId });
    realOtp = user.otp
    if(enteredOtp === realOtp){
      res.status(200).json("otp settttttttttt")
      user.verified = true
      user.save()
    }else{
      res.status(400).json("otp setttttttttttalla")
    }
  }
};
