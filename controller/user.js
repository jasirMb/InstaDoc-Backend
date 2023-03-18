const { router } = require("../server");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user.js");
const doctorSchema = require("../models/doctor");
const appointmentSchema = require("../models/appointment");
const doctorScheduleSchema = require("../models/doctorSchedule");
const recordSchema = require("../models/records");
const chatSchema = require("../models/chat");
const messageSchema = require("../models/messages");
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
    realOtp;
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
    // console.log(doctor);
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
    console.log(date);
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser["user_id"];
    const formattedDate = date.substring(0, 10);

    console.log(userId);
    console.log(formattedDate);
    const Appointmnet = await appointmentSchema.create({
      userId,
      doctorId,
      date: formattedDate,
      time,
      fee: 200,
      status: "Pending",
    });
    Appointmnet.save();
    res.status(200).json("booking success");
  },
  slotcheck: async (req, res) => {
    const { doctorId, date } = req.body;
    console.log(date);
    const formattedDate = date.substring(0, 10);
    const times = await appointmentSchema
      .find({ doctorId: doctorId, date: formattedDate })
      .distinct("time");
    const unAvailable = await doctorScheduleSchema
      .find({
        doctorId: doctorId,
        date: formattedDate,
      })
      .distinct("time");

    console.log(times);

    res.status(200).json({ times, unAvailable });
  },
  resendOtp: async (req, res) => {
    token = req.body.token;
    console.log(req.body);
    const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
    let userId = decodedUser["user_id"];
    const user = await userSchema.findOne({ _id: userId });
    email = user.email;
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

    user.otp = otp;
    user.save();
    res.status(200).json("otp send success");
  },
  getAppointments: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      userId = decoded.user_id;
      const appointments = await appointmentSchema
        .find({ userId: userId })
        .populate("doctorId");
      res.status(200).json(appointments);
    } catch (error) {
      res.status(401);
    }
  },
  cancelAppointment: async (req, res) => {
    try {
      console.log(req.body);

      const appointment = await appointmentSchema.findById(req.body.id);
      appointment.status = "Cancelled";
      appointment.save();
      res.status(200).json(appointment);
    } catch (error) {
      res.status(401);
    }
  },
  upload: async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.file);
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      userId = decoded.user_id;
      const alreadyExist = await recordSchema.findOne({ userId: userId });
      if (alreadyExist === null) {
        const record = await recordSchema.create({
          userId: userId,
          fileName: req.file.originalname,
          path: req.file.path,
        });
        record.save();
        res.status(200).json(record);
      } else {
        alreadyExist.fileName.push(req.file.originalname);
        alreadyExist.path.push(req.file.path);
        alreadyExist.save();
        res.status(200).json(alreadyExist);
      }
    } catch (error) {
    console.log(error);
      res.status(401).json(error);
    }
  },
  getRecords: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      userId = decoded.user_id;
      const records = await recordSchema.findOne({ userId: userId });
      res.status(200).json(records);
    } catch (error) {
      res.status(401).json(error);
    }
  },
  removeRecords: async (req, res) => {
    try {
      console.log(req.body);
      const selectpath = req.body.path;
      fs.unlink(selectpath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      userId = decoded.user_id;
      const records = await recordSchema.findOne({ userId: userId });
      if (records.path.includes(selectpath)) {
        console.log("path is here");
        await recordSchema.updateOne(
          { _id: records._id },
          { $pull: { path: selectpath } }
        );
      }
      res.status(200).json(records);
    } catch (error) {
      res.status(401).json(error);
    }
  },
  onlineDoctor: async (req, res) => {
    try {
      const onlineDoctor = await doctorSchema.find({ active: true });
      res.status(200).json(onlineDoctor);
    } catch (error) {
      res.status(401);
    }
  },
  getUserId: (req, res) => {
    try {
      const role = req.url;
      console.log(role);
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      userId = decoded.user_id;
      res.status(200).json(userId);
    } catch (error) {
      console.log(error);
      res.status(401);
    }
  },
  chatConnection: async (req, res) => {
    try {
      console.log(req.body);
      let senderId = req.body.userId;
      let receiverId = req.body.id;
      const existChat = await chatSchema.find();
      console.log(existChat);
      console.log(receiverId);
      if (existChat.length != 0) {
        for (let i = 0; i < existChat.length; i++) {
          const ids = existChat[i].members;
          console.log(ids.includes(senderId && receiverId));
          if (ids.includes(senderId && receiverId)) {
            console.log("chat is already exist");
          } else {
            console.log("new chst");
            const chat = await chatSchema.create({
              members: [senderId, receiverId],
            });
            chat.save();
            console.log(chat);
          }
        }
      } else {
        console.log("new chst");
        const chat = await chatSchema.create({
          members: [senderId, receiverId],
        });
        chat.save();
        console.log(chat);
      }
      res.status(200).json("success");
    } catch (error) {
      console.log(error);
      res.status(400).json("error");
    }
  },
  newMsg: async (req, res) => {
    try {
      console.log(req.body);
      const senderId = req.body.senderId;
      const recieverId = req.body.receiverId;
      const messages = req.body.messages;
      console.log(req.body);
      const connection = await chatSchema.findOne({
        $and: [{ userid: senderId }, { userid: recieverId }],
      });
      console.log(connection);
      const chatId = connection._id;
      // const oldMessage = await messageSchema.findOne({
      //   $and: [{ chatId }, { senderId }],
      // });
      // if (oldMessage) {
      //   console.log("already had chat");
      //   oldMessage.messages.push(message);
      //   console.log(oldMessage);
      //   oldMessage.save()
      // } else {
      const messageDocument = await messageSchema.create({
        chatId,
        senderId,
        recieverId,
        messages: messages,
      });
      messageDocument.save();
      console.log("new created");
      // }
      res.status(200).json("success");
    } catch (error) {
      console.log(error);
      res.status(400).json("error");
    }
  },
  getMessages: async (req, res) => {
    try {
      console.log(req.body);
     
      const { senderId, receiverId } = req.body;
      const chat = await chatSchema.findOne({
        $and: [{ receiverId }, { senderId }],
      });
      const chatId = chat._id
      const allChats = await messageSchema.find({chatId})
      // const reciever = await userSchema.findById(receiverId)
      // if(!reciever){
      //   const reciever = await doctorSchema.findById(receiverId)
      //   res.status(200).json({allChats,reciever});
      // }else{
        res.status(200).json(allChats);
      
      // console.log(allChats);
      
    } catch (error) {
      console.log(error);
      res.status(401).json("failed");
    }
  },
  getName :async (req,res) => {
    const id = req.params.id
    let recieverName;
    let user = await userSchema.findById(id)
    if(user){
     recieverName = user.username
    }else{
      console.log("its dcitr");
    let doctor = await doctorSchema.findById(id)
     recieverName = doctor.doctorName
    }

    res.status(200).json(recieverName)
  },
  userDetails : async (req,res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      let userId = decoded.user_id;
      const user = await userSchema.findById(userId)
      res.status(200).json(user)
    } catch (error) {
      res.status(500)
    }
  

  }
};
