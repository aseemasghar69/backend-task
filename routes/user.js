const express = require("express");
const router = express.Router();
const { getMyProfile } = require("../controllers/user");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.get("/profile", verifyToken, authorizeRoles(["USER"]), getMyProfile);

module.exports = router;
