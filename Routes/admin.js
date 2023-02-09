const express = require("express");
const router = express.Router();
const adminControls = require("../controller/admin");

router.post("/login",adminControls.postLogin)
router.get("/doctors",adminControls.getDoctors)
router.patch("/doctors/status",adminControls.approve)

module.exports = router;