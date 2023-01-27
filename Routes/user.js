const express = require("express");
const router = express.Router();
const userControls = require("../controller/user");

router.post("/register", userControls.postRegister);
router.post("/login",userControls.postLogin)

module.exports = router;