const express = require("express");
const router = express.Router();
const {
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  assignTask,
  unAssignTask,
  searchTasks,
} = require("../controllers/task");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

router.get("/my", verifyToken, authorizeRoles(["USER", "ADMIN"]), getMyTasks);
router.get(
  "/search",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  searchTasks
);
router.post("/:id/assign", verifyToken, authorizeRoles(["USER"]), assignTask);
router.post(
  "/:id/un-assign",
  verifyToken,
  authorizeRoles(["USER"]),
  unAssignTask
);
router.get("/:id", verifyToken, authorizeRoles(["USER", "ADMIN"]), getTaskById);
router.put("/:id", verifyToken, authorizeRoles(["USER", "ADMIN"]), updateTask);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(["USER", "ADMIN"]),
  deleteTask
);

module.exports = router;
