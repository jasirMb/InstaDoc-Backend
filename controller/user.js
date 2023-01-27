const { router } = require("../server");
const userSchema = require("../models/user.js");

module.exports = {
  postRegister: async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    const user = await userSchema.create({
      username,
      email: email.toLowerCase(),
      password
    });
    user.save((error,registeredUser) => {
        if(error) {
            console.log(error);
        }else{
            res.status(200).send(registeredUser)
        }
    })
  },
  postLogin :async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;
    console.log(email +"heyyyyyyy");
    const user = await userSchema.findOne({email:email});
    console.log(user);
    if(user){
        console.log("user here");
        if(user.password === password){
            res.status(200).send("login succesfull")
        }else{
            res.status(403).send("invalid password")
        }
    }else{
        console.log("user not here");
        res.status(404).send("user not exist")
    }
  }
};
