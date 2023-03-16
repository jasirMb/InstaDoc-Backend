const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminSchema = require("../models/admin");
const userSchema = require("../models/user");
const doctorSchema = require("../models/doctor");
const appointmentSchema = require("../models/appointment");
const { use } = require("../Routes/doctor.js");

module.exports = {
  postLogin: async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    console.log(email + "    heyyyyyyy");
    const admin = await adminSchema.findOne({ email });
    console.log(admin);
    if (admin) {
      console.log("admin here");
      if (await bcrypt.compare(password, admin.password)) {
        const token = jwt.sign(
          { admin_id: admin._id, type: "admin" },

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
      console.log("admin not here");
      res.status(401).send("admin not exist");
    }
  },
  getDoctors: async (req, res) => {
    const pendingDoctors = await doctorSchema.find({
      approved: false,
      access: true,
    });

    const allDoctors = await doctorSchema.find({ approved: true });

    const result = { pendingDoctors, allDoctors };
    res.status(200).json(result);
  },
  statusChange: async (req, res) => {
    console.log("you are in access changer");
    // res.status(200)
    console.log(req.body);
    doctorId = req.body.id;
    approve = req.body.approved;
    rejected = req.body.rejected;
    if (approve && !rejected) {
      console.log("on approve");

      const result = await doctorSchema.findByIdAndUpdate(doctorId, {
        approved: true,
      });
      console.log(result);
      result.save();
      res.status(200).send(result);
    } else if (!approve && rejected) {
      console.log("on reject");
      const result = await doctorSchema.findByIdAndUpdate(doctorId, {
        status: false,
      });
      result.save();
      console.log(result);
      res.status(200).send(result);
    }
  },
  accessChange: async (req, res) => {
    doctorId = req.body.id;
    const result = await doctorSchema.findById(doctorId);
    result.access = !result.access;
    console.log(result.access);
    result.save();
    res.status(200).json(result);
  },
  getUsers: async (req, res) => {
    const Users = await userSchema.find({});

    res.status(200).json(Users);
  },
  userAccessChange: async (req, res) => {
    try {
      userId = req.body.id;
      const result = await userSchema.findById(userId);
      result.access = !result.access;
      console.log(result.access);
      result.save();
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json(error);
    }
  },
  getDetails: async (req, res) => {
    try {
      console.log("backkkkkkk");
      const users = await userSchema.find().count();
      const doctors = await doctorSchema.find().count();
      const appointments = await appointmentSchema.find().count();
      const cancelled = await appointmentSchema
        .find({ status: "Cancelled" })
        .count();
      let data = {
        users,
        doctors,
        appointments,
        cancelled,
      };
      res.status(200).json(data);
    } catch (error) {}
  },
  getGraphDetails: async (req, res) => {
    try {
      let data = await appointmentSchema
      .aggregate([
        // Convert the date string to an actual date
        {
          $addFields: {
            appointmentDate: { $toDate: "$date" },
          },
        },
        // Group appointments by week and count the number of documents in each week
        {
          $group: {
            _id: {
              $let: {
                vars: {
                  startDate: {
                    $subtract: [
                      "$appointmentDate",
                      {
                        $multiply: [
                          { $dayOfWeek: "$appointmentDate" },
                          86400000,
                        ],
                      },
                    ],
                  },
                },
                in: {
                  startOfWeek: {
                    $dateToString: { format: "%Y-%m-%d", date: "$$startDate" },
                  },
                },
              },
            },
            count: { $sum: 1 },
          },
        },
        // Sort the results by start of week in ascending order
        { $sort: { "_id.startOfWeek": 1 } },
      ])
      .exec();
    let status =await appointmentSchema
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .exec();
      console.log(status);
    res.status(200).json({ data, status });
    } catch (error) {
      console.log(error);
    }
    
  },
};
