const express = require("express");
const router = express.Router();
const adminControls = require("../controller/admin");

router.post("/login",adminControls.postLogin)
router.get("/doctors",adminControls.getDoctors)
router.put("/doctors/status",adminControls.statusChange)
router.patch("/doctors/access",adminControls.accessChange)


module.exports = router;