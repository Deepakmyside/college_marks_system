const express = require("express");
const router = express.Router();

const { createAssignment, getMyAssignments } = require("../controllers/teacherAssignmentController")

router.post("/", createAssignment);
router.get("/:teacherId",getMyAssignments)
module.exports = router;