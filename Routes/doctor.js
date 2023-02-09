const express = require("express");
const router = express.Router();
const doctorControls = require("../controller/doctor");

router.post("/register", doctorControls.postRegister);
router.post("/login", doctorControls.postLogin);
module.exports = router;