const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user.js");
const doctorSchema = require("../models/doctor");
const appointmentSchema = require("../models/appointment");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(
  "sk_test_51McR2MSACriAWWdeBjDXkW9S6TZx07NvcxZUORdV8GWtAa7IgkJM5Jvlib0CaGtLi0OEDeYp23gKtwbCiu9nqyt1006ukl4A89"
);

module.exports = {
  postRegister: async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    // validating inputs
    if (!(email && password && username)) {
      res.status(400).send("All input is required");
    }
    // checking if user already exist?
    console.log(email);
    const existUser = await userSchema.findOne({ email });
    console.log(email);
    if (existUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    // ...................... setting otp..............................//
    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    // ......................seting up node mailaer.................//
    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: "jasirmbmb9118@gmail.com",
        pass: process.env.EMAIL_AUTH,
      },
    });
    let details = {
      from: "jasirmbmb9118@gmail.com",
      to: email,
      subject: "OTP FOR REGISTRASTION",
      text: "your OTP for Registering INSTADOC :" + otp,
    };
    mailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log("errorrooro", err);
      } else {
        console.log("mail has been sended");
      }
    });
    // ......................setup finsished........................//
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await userSchema.create({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
      otp,
    });
    user.save((error, registeredUser) => {
      if (error) {
        console.log(error);
      } else {
        let username = user.username;
        const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
          expiresIn: "2h",
        });
        res.status(200).json({ token });
      }
    });
    console.log(req.session.otp + "last");
  },
  postLogin: async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    console.log(email + "heyyyyyyy");
    const user = await userSchema.findOne({ email: email });
    if (user) {
      if (user.access) {
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign(
            { user_id: user._id, type: "user" },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          res.status(200).json({ token });
        } else {
          res.status(401).send("invalid password");
        }
      } else {
        res.status(403).send("you have been blocked.!");
      }
    } else {
      console.log("user not here");
      res.status(401).send("user not exist");
    }
  },
  otpVerify: async (req, res) => {
    data = req.body.data;
    token = req.body.token;
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser["user_id"];
    console.log(decodedUser);
    let enteredOtp = data.otp1 + data.otp2 + data.otp3 + data.otp4;
    console.log(enteredOtp);
    const user = await userSchema.findOne({ _id: userId });
    realOtp = user.otp;
    if (enteredOtp === realOtp) {
      res.status(200).json("otp verification success");
      user.verified = true;
      user.save();
    } else {
      res.status(400).json("otp verification failed");
    }
  },
  getdoctors: async (req, res) => {
    const doctors = await doctorSchema.find({ approved: true, access: true });
    const specialization = await doctorSchema.distinct("specialization");

    res.status(200).json({ doctors, specialization });
  },
  getDoctor: async (req, res) => {
    doctorId = req.query.value;
    doctor = await doctorSchema.findById(doctorId);
    console.log(doctor);
    res.status(200).json(doctor);
  },
  checkout: async (req, res) => {
    try {
      // console.log(req.body);
      token = req.body.id;
      // console.log(token);
      const customer = stripe.customers
        .create({
          email: "jasirmbmb9118@gmail.com",
          source: token.id,
        })
        .then((customer) => {
          console.log(
            "heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
          );
          return stripe.charges.create({
            amount: 1000,
            description: "booking doctor",
            currency: "USD",
            customer: customer.id,
            payment_methode_types: ["card"],
          });
        })
        .then((charge) => {
          console.log(charge);
          res.json({
            data: "false",
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            data: "success",
          });
        });
      return true;
    } catch (error) {
      return false;
    }
  },
  createOrder: async (req, res) => {
    const { doctorId, token, date, time } = req.body;
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser["user_id"];
    const formattedDate = date.substring(0, 10);

    console.log(userId);
    console.log(formattedDate);
    const Appointmnet = await appointmentSchema.create({
      userId,
      doctorId,
      date:formattedDate,
      time,
      fee : 200,
      status : "Placed"

    });
    Appointmnet.save()
    res.status(200).json("booking success")
  },
  slotcheck : async(req,res) => {
    const { doctorId,date } = req.body;
    console.log(date);
    const formattedDate = date.substring(0, 10);
     const times = await appointmentSchema.find({ doctorId: doctorId, date: formattedDate }).distinct('time')
     
      
    console.log(times);
  
    res.status(200).json(times)

  },
  resendOtp : async (req,res) => {
    token = req.body.token
    console.log(req.body);
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser["user_id"];
    const user = await userSchema.findOne({ _id: userId });
    email =  user.email
    let otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(otp);
    // ......................seting up node mailaer.................//
    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: "jasirmbmb9118@gmail.com",
        pass: process.env.EMAIL_AUTH,
      },
    });
    let details = {
      from: "jasirmbmb9118@gmail.com",
      to: email,
      subject: "OTP FOR REGISTRASTION",
      text: "your OTP for Registering INSTADOC :" + otp,
    };
    mailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log("errorrooro", err);
      } else {
        console.log("mail has been sended");
      }
    });
   
    user.otp = otp
    user.save()
    res.status(200).json("otp send success")

  }
};
