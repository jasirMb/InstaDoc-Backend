const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const doctorSchema = require("../models/doctor");
const appointmentSchema = require("../models/appointment");
const doctorScheduleSchema = require("../models/doctorSchedule");
const mongoose = require("mongoose");

module.exports = {
  postRegister: async (req, res) => {
    console.log(req.body);
    try {
      const {
        doctorName,
        email,
        specialization,
        gender,
        city,
        doctorId,
        experience,
        password,
      } = req.body;
      // validating inputs

      if (
        !(email && doctorName && password && specialization && city && gender)
      ) {
        res.status(400).send("All input is required");
      }
      // checking if user already exist?
      const existDoctor = await doctorSchema.findOne({ email });

      if (existDoctor) {
        return res.status(409).send("doctor Already Exist. Please Login");
      }

      encryptedPassword = await bcrypt.hash(password, 10);
      const doctor = await doctorSchema.create({
        doctorName,
        email: email.toLowerCase(),
        specialization,
        city,
        gender,
        doctorId,
        experience,
        password: encryptedPassword,
        // approved : false
      });
      console.log(doctor.experience + "exppppppppppppp");
      doctor.save((error) => {
        if (error) {
          console.log("errrrrrrr");
          console.log(error);
        } else {
          console.log(email);
          const token = jwt.sign(
            { doctor_id: doctor._id, type: "doctor" },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          res.status(200).json({ token });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(400).json("something went wrong");
    }
  },
  postLogin: async (req, res) => {
    // console.log(req.body);
    try {
      const { email, password } = req.body;

      console.log(email + "    heyyyyyyy");
      const doctor = await doctorSchema.findOne({ email });
      console.log(doctor);
      if (doctor.access) {
        if (doctor) {
          console.log("doctor here");
          if (await bcrypt.compare(password, doctor.password)) {
            const token = jwt.sign(
              { doctor_id: doctor._id, type: "doctor" },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );
            doctor.active = true;
            doctor.save();
            res.status(200).json({ token });
          } else {
            res.status(401).send("invalid password");
          }
        } else {
          console.log("doctor not here");
          res.status(401).send("doctor not exist");
        }
      } else {
        res.status(403).send("you have been blocked!");
      }
    } catch (error) {
      console.log(error);
      res.status(400).json("something went wrong");
    }
  },
  schedule: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const date = req.body.date;
      const formattedDate = date.substring(0, 10);
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const appointments = await appointmentSchema
        .find({
          doctorId: decoded.doctor_id,
          date: formattedDate,
          status: "Placed",
        })
        .distinct("time");
      const unAvailable = await doctorScheduleSchema
        .find({
          doctorId: decoded.doctor_id,
          date: formattedDate,
        })
        .distinct("time");
      console.log(unAvailable);
      console.log(decoded);
      res.status(200).json({ appointments, unAvailable });
    } catch (error) {
      console.log(error);
    }
  },
  cancelAppointment: async (req, res) => {
    try {
      console.log(req.body);
      if (req.body.id) {
        const appointment = await appointmentSchema.findById(req.body.id);
        appointment.status = "Cancelled";
        appointment.save();
        res.status(200).json(appointment);
      } else {
        date = req.body.date;
        time = req.body.time;
        const formattedDate = date.substring(0, 10);
        const token = req.headers["authorization"].split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const appointment = await appointmentSchema.findOne({
          doctorId: decoded.doctor_id,
          date: formattedDate,
          time: time,
        });
        appointment.status = "Cancelled";
        appointment.save();
        console.log("heyyyyyyyy");
        console.log(appointment);
        console.log(req.body.date);
        res.status(200).json(date);
      }
    } catch (error) {
      console.log(error);
    }
  },
  notAvailable: async (req, res) => {
    console.log("on backend");

    try {
      date = req.body.date;
      time = req.body.time;
      console.log(date);
      const formattedDate = date.substring(0, 10);
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      doctorId = decoded.doctor_id;
      const alreadySchedule = await doctorScheduleSchema.findOne({
        doctorId,
        formattedDate,
        time,
      });
      if (alreadySchedule) {
        await doctorScheduleSchema.findOneAndDelete({
          doctorId,
          formattedDate,
          time,
        });
      } else {
        const schedule = await doctorScheduleSchema.create({
          doctorId: doctorId,
          date: formattedDate,
          time: time,
        });
        schedule.save();
      }
      res.status(200).json("success");
    } catch (error) {
      console.log(error);
    }
  },
  getAppointments: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      doctorId = decoded.doctor_id;
      const newAppointments = await appointmentSchema
        .find({ doctorId: doctorId, status: "Pending" })
        .populate("userId");
      const appointments = await appointmentSchema
        .find({ doctorId: doctorId, status: { $ne: "Pending" } })
        .populate("userId");
      console.log(appointments);
      res.status(200).json({ appointments, newAppointments });
    } catch (error) {
      res.status(401);
    }
  },
  getDocId: (req, res) => {
    try {
      console.log("onDoc");
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      doctorId = decoded.doctor_id;
      res.status(200).json(doctorId);
    } catch (error) {
      console.log(error);
    }
  },
  doctorDetails: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const doctorId = decoded.doctor_id;
      const doctor = await doctorSchema.findOne({ _id: doctorId });
      res.status(200).json(doctor);
    } catch (error) {
      console.log(error);
    }
  },
  allPatients: async (req, res) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const doctorId = mongoose.Types.ObjectId(decoded.doctor_id);
      console.log(doctorId);
      const patients = appointmentSchema
        .aggregate([
          { $match: { doctorId: doctorId } },
          {
            $lookup: {
              from: "user",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              _id: 0,
              username: { $arrayElemAt: ["$user.username", 0] },
              email: { $arrayElemAt: ["$user.email", 0] },
              date: 1,
            },
          },
          {
            $group: {
              _id: { username: "$username", email: "$email" },
              dates: { $push: "$date" },
            },
          },
          { $sort: { _id: -1 } },
        ])
        .exec((err, patients) => {
          if (err) {
            console.error(err);
            return;
          }

          console.log(patients);
          res.status(200).json(patients);
        });
    } catch (error) {
      console.log(error);
    }
  },
  statusChange: async (req, res) => {
    console.log("you are in access changer");
    // res.status(200)
    console.log(req.body);
    appointmentId = req.body.id;
    approve = req.body.approved;
    rejected = req.body.rejected;
    if (approve && !rejected) {
      console.log("on approve");

      const result = await appointmentSchema.findByIdAndUpdate(appointmentId, {
        status: "Placed",
      });
      console.log(result);
      result.save();
      res.status(200).send(result);
    } else if (!approve && rejected) {
      console.log("on reject");
      const result = await appointmentSchema.findByIdAndUpdate(appointmentId, {
        status: "Cancelled",
      });
      result.save();
      console.log(result);
      res.status(200).send(result);
    }
  },
  logout: async(req, res) => {
    try {
      console.log("logoutttttttttttttttttttttttttttttttttttt");
      const token = req.headers["authorization"].split(" ")[1];
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const doctorId = mongoose.Types.ObjectId(decoded.doctor_id);
      console.log(doctorId);
      const doctor = await doctorSchema.findOneAndUpdate( doctorId, {
        active: false},
       
      );
      console.log(doctor);
      // doctor.save()
     
      console.log("kjhgfghjk");
      res.status(200).json("success");
    } catch (error) {
      console.log(error);
      res.status(401).json("failed");
    }
  },
};
