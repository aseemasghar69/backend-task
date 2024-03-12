const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../database/db.config.js");

//  Register user
exports.signup = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    let hash = await bcrypt.hash(req.body.password, 10);
    req.body.password = hash;

    let user = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      return next(new ErrorResponse("Email Already Taken!", 400));
    }

    const createdUser = await prisma.users.create({
      data: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: createdUser,
    });
  } else {
    return next(new ErrorResponse("Please Provide valid credentials", 400));
  }
});

//  Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;

  if (email && password) {
    let user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid credentials!", 400));
    }

    var passwordIsValid = await bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return next(new ErrorResponse("Invalid password!", 401));
    }

    var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    delete user.password;
    return res.status(200).json({
      success: true,
      data: user,
      message: "Login Successful.",
      accessToken: token,
    });
  } else {
    return next(new ErrorResponse("Please provide login credentials", 400));
  }
});
