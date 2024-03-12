const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const prisma = require("../database/db.config.js");
const cloudinary = require("cloudinary").v2;
//  create task
exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, description, due_date } = req.body;
  const projectId = req.params.projectId;
  let files = [];

  if (req.files && req.files.files) {
    const uploadOptions = {
      folder: "02",
    };

    if (Array.isArray(req.files.files)) {
      for (let file of req.files.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                console.error("Error uploading image:", error.message);
                reject(error);
              } else {
                files.push({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
                resolve(result);
              }
            }
          );

          uploadStream.end(file.data);
        });
      }
    } else {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error("Error uploading image:", error.message);
              reject(error);
            } else {
              files.push({
                url: result.secure_url,
                public_id: result.public_id,
              });
              resolve(result);
            }
          }
        );

        uploadStream.end(req.files.files.data);
      });
    }

    console.log("Uploaded files:", files);
  }

  const newTask = await prisma.tasks.create({
    data: {
      files: files,
      title,
      description,
      due_date,
      project_id: Number(projectId),
    },
  });
  return res.json({
    status: 200,
    message: "Task created successfully.",
    data: newTask,
  });
});

//  get tasks of a project
exports.getProjectTasks = asyncHandler(async (req, res, next) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;
  const projectId = req.params.projectId;

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0 || limit > 100) {
    limit = 10;
  }
  const skip = (page - 1) * limit;
  const tasks = await prisma.tasks.findMany({
    skip,
    take: limit,
    include: {
      project: {
        include: {
          owner: true,
          Tasks: true,
        },
      },
      user: true,
    },
    orderBy: {
      id: "desc",
    },
    where: {
      project_id: Number(projectId),
    },
  });
  //   * to get the total task count
  const totalTasks = await prisma.tasks.count();
  const totalPages = Math.ceil(totalTasks / limit);
  return res.json({
    status: 200,
    data: tasks,
    meta: {
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

//  get my tasks
exports.getMyTasks = asyncHandler(async (req, res, next) => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0 || limit > 100) {
    limit = 10;
  }
  const skip = (page - 1) * limit;
  const tasks = await prisma.tasks.findMany({
    skip,
    take: limit,
    include: {
      project: {
        include: {
          owner: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
    where: {
      user_id: req.user.id,
    },
  });
  //   * to get the total task count
  const totalTasks = await prisma.tasks.count();
  const totalPages = Math.ceil(totalTasks / limit);
  return res.json({
    status: 200,
    data: tasks,
    meta: {
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

//  get task by id
exports.getTaskById = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const task = await prisma.tasks.findFirst({
    where: {
      id: Number(taskId),
    },
    include: {
      project: {
        include: {
          owner: true,
        },
      },
      user: true,
    },
  });

  if (!task) {
    return res.json({
      status: 404,
      message: `Task not found with id: ${taskId}`,
    });
  }

  return res.json({ status: 200, data: task });
});

// update a task
exports.updateTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const { title, description, due_date, completed } = req.body;
  const task = await prisma.tasks.findFirst({
    where: {
      id: Number(taskId),
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return res.json({
      status: 404,
      message: `Task not found with id: ${taskId}`,
    });
  }
  if (task.project.owner_id == req.user.id || req.user.role == "ADMIN") {
    await prisma.tasks.update({
      where: {
        id: Number(taskId),
      },
      data: {
        title,
        description,
        due_date,
        completed,
      },
    });

    return res.json({ status: 200, message: "Task updated successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// delete task
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const task = await prisma.tasks.findFirst({
    where: {
      id: Number(taskId),
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return res.json({
      status: 404,
      message: `Task not found with id: ${taskId}`,
    });
  }
  if (task.project.owner_id == req.user.id || req.user.role == "ADMIN") {
    const publicIdsToDelete = task.files.map((file) => file.public_id);

    try {
      for (const publicId of publicIdsToDelete) {
        await cloudinary.uploader.destroy(publicId);
        console.log(`File with public ID ${publicId} deleted from Cloudinary`);
      }
    } catch (error) {
      console.error("Error deleting files from Cloudinary:", error);
    }
    await prisma.tasks.delete({
      where: {
        id: Number(taskId),
      },
    });

    return res.json({ status: 200, msg: "Task deleted successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// assign task
exports.assignTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const { user_id } = req.body;
  const task = await prisma.tasks.findFirst({
    where: {
      id: Number(taskId),
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return res.json({
      status: 404,
      message: `Task not found with id: ${taskId}`,
    });
  }
  if (task.project.owner_id == req.user.id) {
    await prisma.tasks.update({
      where: {
        id: Number(taskId),
      },
      data: {
        user_id,
      },
    });

    return res.json({ status: 200, message: "Task assigned successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// unassign task
exports.unAssignTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const { user_id } = req.body;
  const task = await prisma.tasks.findFirst({
    where: {
      id: Number(taskId),
    },
    include: {
      project: true,
    },
  });

  if (!task) {
    return res.json({
      status: 404,
      message: `Task not found with id: ${taskId}`,
    });
  }
  if (task.user_id !== user_id) {
    return res.json({
      status: 400,
      message: `User was not assign this task!`,
    });
  }
  if (task.project.owner_id == req.user.id) {
    await prisma.tasks.update({
      where: {
        id: Number(taskId),
      },
      data: {
        user_id: null,
      },
    });

    return res.json({ status: 200, message: "Task un-assigned successfully" });
  } else {
    return res.json({
      status: 404,
      message: `Unauthorize action!`,
    });
  }
});

// search task
exports.searchTasks = asyncHandler(async (req, res, next) => {
  const query = req.query.q;
  const tasks = await prisma.tasks.findMany({
    where: {
      title: {
        search: query,
      },
    },
    include: {
      user: true,
      project: true,
    },
  });

  return res.json({ status: 200, data: tasks });
});
