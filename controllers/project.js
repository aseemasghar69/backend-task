const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const prisma = require("../database/db.config.js");

//  create project
exports.createProject = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const newProject = await prisma.projects.create({
    data: {
      name,
      description,
      owner_id: req.user.id,
    },
  });

  return res.json({
    status: 200,
    message: "Project created successfully.",
    data: newProject,
  });
});

//  get all projects
exports.getProjects = asyncHandler(async (req, res, next) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0 || limit > 100) {
    limit = 10;
  }
  const skip = (page - 1) * limit;
  const projects = await prisma.projects.findMany({
    skip,
    take: limit,
    include: {
      owner: true,
      Tasks: true,
    },
    orderBy: {
      id: "desc",
    },
  });
  //   * to get the total project count
  const totalProjects = await prisma.projects.count();
  const totalPages = Math.ceil(totalProjects / limit);
  return res.json({
    status: 200,
    data: projects,
    meta: {
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

//  get my projects
exports.getMyProjects = asyncHandler(async (req, res, next) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0 || limit > 100) {
    limit = 10;
  }
  const skip = (page - 1) * limit;
  const projects = await prisma.projects.findMany({
    skip,
    take: limit,
    include: {
      Tasks: true,
    },
    where: {
      owner_id: req.user.id,
    },
    orderBy: {
      id: "desc",
    },
  });
  //   * to get the total project count
  const totalProjects = await prisma.projects.count();
  const totalPages = Math.ceil(totalProjects / limit);
  return res.json({
    status: 200,
    data: projects,
    meta: {
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

//  get project by id
exports.getProjectById = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const project = await prisma.projects.findFirst({
    where: {
      id: Number(projectId),
    },
    include: {
      owner: true,
      Tasks: true,
    },
  });
  if (!project) {
    return res.json({
      status: 404,
      message: `Project not found with id: ${projectId}`,
    });
  }

  return res.json({ status: 200, data: project });
});

// update a project
exports.updateProject = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const { name, description } = req.body;
  const project = await prisma.projects.findFirst({
    where: {
      id: Number(projectId),
    },
  });
  if (!project) {
    return res.json({
      status: 404,
      message: `Project not found with id: ${projectId}`,
    });
  }
  if (project.owner_id == req.user.id || req.user.role == "ADMIN") {
    await prisma.projects.update({
      where: {
        id: Number(projectId),
      },
      data: {
        name,
        description,
      },
    });

    return res.json({ status: 200, message: "Project updated successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// delete project
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const projectId = req.params.id;
  const project = await prisma.projects.findFirst({
    where: {
      id: Number(projectId),
    },
    include: {
      Tasks: true,
    },
  });
  if (!project) {
    return res.json({
      status: 404,
      message: `Project not found with id: ${projectId}`,
    });
  }
  if (project.owner_id == req.user.id || req.user.role == "ADMIN") {
    for (let task of project.Tasks) {
      const publicIdsToDelete = task.files.map((file) => file.public_id);

      try {
        for (const publicId of publicIdsToDelete) {
          await cloudinary.uploader.destroy(publicId);
          console.log(
            `File with public ID ${publicId} deleted from Cloudinary`
          );
        }
      } catch (error) {
        console.error("Error deleting files from Cloudinary:", error);
      }
    }
    await prisma.projects.delete({
      where: {
        id: Number(projectId),
      },
    });

    return res.json({ status: 200, msg: "Project deleted successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// search project
exports.searchProjects = asyncHandler(async (req, res, next) => {
  const query = req.query.q;
  const projects = await prisma.projects.findMany({
    where: {
      name: {
        search: query,
      },
    },
    include: {
      owner: true,
      Tasks: true,
    },
  });

  return res.json({ status: 200, data: projects });
});
