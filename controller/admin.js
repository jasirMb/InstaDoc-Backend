const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminSchema = require("../models/admin");
const userSchema = require("../models/user")
const doctorSchema = require("../models/doctor")

module.exports = {
  
  postLogin: async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
  
    console.log(email + "    heyyyyyyy");
    const admin = await adminSchema.findOne({email});
    console.log(admin);
    if (admin) {
      console.log("admin here"); 
      if ((await bcrypt.compare(password, admin.password))) {
        
        res.status(200).json(admin);
      } else {
        res.status(401).send("invalid password");
      }
    } else {
      console.log("admin not here");
      res.status(401).send("admin not exist");
    }
  },
  getDoctors : async(req,res) => {
    
    const pendingDoctors = await doctorSchema.find({approved : false});
    
    const allDoctors = await doctorSchema.find({})
    
    const result = { pendingDoctors, allDoctors };
    res.status(200).json(result);
    
  },
  approve :async (req,res) => {
    console.log("you are in access changer")
    // doctorId = req.body._id
    // console.log(doctorId);
    // const result = await doctorSchema.findByIdAndUpdate(doctorId, { approved : true  })
    // result.save()
    
    // res.status(200).send(result)

  }
};

