const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const prisma = require("../database/db.config.js");

//  get my profile
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  let user = await prisma.users.findFirst({
    where: {
      id: req.user.id,
    },
  });
  delete user.password;
  const projects = await prisma.projects.findMany({
    where: {
      owner_id: req.user.id,
    },
    include: {
      Tasks: true,
    },
    orderBy: {
      id: "desc",
    },
  });
  const tasks = await prisma.tasks.findMany({
    include: {
      project: true,
    },
    orderBy: {
      id: "desc",
    },
    where: {
      user_id: req.user.id,
    },
  });
  return res.json({
    status: 200,
    data: { ...user, projects, tasks },
  });
});
