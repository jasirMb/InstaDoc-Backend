const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const doctorSchema = require("../models/doctor");

module.exports = {
  postRegister: async (req, res) => {
    console.log(req.body );
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
        password : encryptedPassword,
        // approved : false
      });
      console.log(doctor.experience+"exppppppppppppp");
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
      res.status(400).json("something went wrong")
    }
   
  },
  postLogin: async (req, res) => {
    // console.log(req.body);
    try {
      const { email, password } = req.body;
  
      console.log(email + "    heyyyyyyy");
      const doctor = await doctorSchema.findOne({ email });
      console.log(doctor);
      if(doctor.access){
        
        if (doctor) {
          console.log("doctor here");
          if ((await bcrypt.compare(password, doctor.password))) {
            const token = jwt.sign(
              { doctor_id : doctor._id, type: "doctor" },
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
          console.log("doctor not here");
          res.status(401).send("doctor not exist");
        }
      }else{
        res.status(403).send("you have been blocked!");
      }
    } catch (error) {
      console.log(error);
      res.status(400).json("something went wrong")
    }
   
  },
};
