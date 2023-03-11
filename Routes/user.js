const express = require("express");
const router = express.Router();
const userControls = require("../controller/user");
const verifyToken = require("../middleware/authentication");
const isBlocked = require("../middleware/isBlock");

const upload = require("../middleware/multer")

router.post("/register",userControls.postRegister);
router.post("/login",userControls.postLogin)
router.post("/otpVerify",userControls.otpVerify)
router.get("/doctors",isBlocked,userControls.getdoctors)
router.get("/single-doctor",verifyToken,isBlocked,userControls.getDoctor)
router.post("/checkout",verifyToken,isBlocked,userControls.checkout)
router.post("/order",verifyToken,isBlocked,userControls.createOrder)
router.post("/slotcheck",verifyToken,isBlocked,userControls.slotcheck)
router.get("/appointments",verifyToken,isBlocked,userControls.getAppointments)
router.patch("/resendotp",userControls.resendOtp)
router.patch("/cancel-appointment",verifyToken,isBlocked,userControls.cancelAppointment)
router.post("/record-upload",verifyToken,isBlocked,upload.single('file'),userControls.upload)
router.get("/get-records",verifyToken,isBlocked,userControls.getRecords)
router.patch("/remove-records",verifyToken,isBlocked,userControls.removeRecords)
router.get("/online-doctor",verifyToken,isBlocked,userControls.onlineDoctor)
router.get("/user-id",verifyToken,isBlocked,userControls.getUserId)
router.post("/chatConnection",verifyToken,isBlocked,userControls.chatConnection)
router.post("/newMsg",verifyToken,isBlocked,userControls.newMsg)
router.post("/allMessages",verifyToken,isBlocked,userControls.getMessages)





module.exports = router;