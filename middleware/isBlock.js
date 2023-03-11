const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const userSchema = require("../models/user");
// here we are checking if the user has been blocked or not//
const isBlocked = async (req, res, next) => {
  try {
    console.log("on block middleware");
    const config = process.env;
    const token = req.headers["authorization"].split(" ")[1];
    const decodedUser = jwt.verify(token, config.TOKEN_KEY);
    id = decodedUser.user_id;
    const user = await userSchema.findById(id);
    if (!user.access) {
      return res.status(401).json("hey");
    }
  } catch (error) {
    console.log(error);
    console.log("working");
    return res.status(401).json("hey");
  }
  console.log(" ");
  return next();
};
module.exports = isBlocked;
