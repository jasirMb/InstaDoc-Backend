const { router } = require("../server");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user.js");

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
    encryptedPassword = await bcrypt.hash(password, 10);
    const user = await userSchema.create({
      username,
      email: email.toLowerCase(),
      password : encryptedPassword,
    });
    user.save((error, registeredUser) => {
      if (error) {
        console.log(error);
      } else {
      let  username = user.username
        const token = jwt.sign(
            { user_id: user._id, type: "user" },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
        res.status(200).json({token});
      }
    });
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
};
