const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/auth");

router.post("/register", signup);
router.post("/login", login);

module.exports = router;
