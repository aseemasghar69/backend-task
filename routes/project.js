const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  searchProjects,
} = require("../controllers/project");
const { createTask, getProjectTasks } = require("../controllers/task");

const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.post("/", verifyToken, authorizeRoles(["USER", "ADMIN"]), createProject);
router.get("/", verifyToken, authorizeRoles(["ADMIN"]), getProjects);
router.get(
  "/my",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  getMyProjects
);
router.get(
  "/search",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  searchProjects
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  getProjectById
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  updateProject
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  deleteProject
);

router.post(
  "/:projectId/tasks",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  createTask
);
router.get(
  "/:projectId/tasks",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  getProjectTasks
);

module.exports = router;
