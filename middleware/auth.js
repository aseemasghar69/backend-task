const jwt = require("jsonwebtoken");
const prisma = require("../database/db.config.js");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized!",
      });
    }
    let user = await prisma.users.findUnique({
      where: {
        id: decoded.id,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }
    req.user = user;
    next();
  });
};

exports.authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role: ${req.user.role} is not allowed to access this resource`,
      });
    }

    next();
  };
};
