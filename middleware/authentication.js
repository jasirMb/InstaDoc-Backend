const jwt = require("jsonwebtoken");
// const isBlocked = require('../middleware/isBlock')

const config = process.env;

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    // console.log(token);

    if (token === null) {
      console.log("no tken");
      return res.status(401).send("A token is required for authentication");
    }
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (error) {
    return res.status(401);
  }
  return next();
};

module.exports = verifyToken;
