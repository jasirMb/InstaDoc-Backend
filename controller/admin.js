const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminSchema = require("../models/admin");
const userSchema = require("../models/user");
const doctorSchema = require("../models/doctor");

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
          { admin_id : admin._id, type: "admin" },
          
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        res.status(200).json({token});
      } else {
        res.status(401).send("invalid password");
      }
    } else {
      console.log("admin not here");
      res.status(401).send("admin not exist");
    }
  },
  getDoctors: async (req, res) => {
    const pendingDoctors = await doctorSchema.find({ approved: false , access : true });

    const allDoctors = await doctorSchema.find({approved: true});

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
  accessChange : async(req,res) => {
    doctorId = req.body.id
    const result = await doctorSchema.findById(doctorId);
    result.access = !result.access
    console.log(result.access); 
    result.save()
    res.status(200).json(result)
  },
  getUsers : async (req,res) => {
    const Users = await userSchema.find({});

    
    res.status(200).json(Users);
  },
  userAccessChange: async(req,res) => {
    userId = req.body.id
    const result = await userSchema.findById(userId);
    result.access = !result.access
    console.log(result.access);
    result.save()
    res.status(200).json(result)
  }
};
