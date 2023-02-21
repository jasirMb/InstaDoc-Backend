const express = require("express");
const router = express.Router();
const userControls = require("../controller/user");
const verifyToken = require("../middleware/authentication");

router.post("/register",userControls.postRegister);
router.post("/login",userControls.postLogin)
router.post("/otpVerify",userControls.otpVerify)
router.get("/doctors",userControls.getdoctors)
router.get("/single-doctor",verifyToken,userControls.getDoctor)
router.post("/checkout",verifyToken,userControls.checkout)
router.post("/order",verifyToken,userControls.createOrder)
router.post("/slotcheck",verifyToken,userControls.slotcheck)
router.patch("/resendotp",userControls.resendOtp)


module.exports = router;