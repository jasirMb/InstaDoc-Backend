const express = require("express");
const router = express.Router();
const doctorControls = require("../controller/doctor");
const verifyToken = require("../middleware/authentication");

router.post("/register", doctorControls.postRegister);
router.post("/login", doctorControls.postLogin);
router.post("/schedule",verifyToken,doctorControls.schedule)
router.patch("/cancel-appointment",verifyToken,doctorControls.cancelAppointment)
router.post("/unavailable",verifyToken,doctorControls.notAvailable)
router.get("/appointments",verifyToken,doctorControls.getAppointments)
router.get("/doctor-id",doctorControls.getDocId)
router.get("/doctor-profile",doctorControls.doctorDetails)
router.get("/patients",doctorControls.allPatients)
router.put("/appointment/status",verifyToken,doctorControls.statusChange)
router.patch("/logout",verifyToken,doctorControls.logout)
module.exports = router;