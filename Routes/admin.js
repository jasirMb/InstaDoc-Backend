const express = require("express");
const router = express.Router();
const adminControls = require("../controller/admin");
const verifyToken = require("../middleware/authentication");
const auth = require("../middleware/authentication")

router.post("/login",adminControls.postLogin)
router.get("/doctors",verifyToken,adminControls.getDoctors)
router.put("/doctors/status",verifyToken,adminControls.statusChange)
router.patch("/doctors/access",verifyToken,adminControls.accessChange)
router.get("/users",verifyToken,adminControls.getUsers)
router.patch("/users/access",verifyToken,adminControls.userAccessChange)
router.get("/details",verifyToken,adminControls.getDetails)
router.get("/graph",verifyToken,adminControls.getGraphDetails)


module.exports = router;