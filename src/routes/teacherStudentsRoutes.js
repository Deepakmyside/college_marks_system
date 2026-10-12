const express = require("express");

const {
  getTeacherStudents,
} = require("../controllers/teacherStudentsController");

const router = express.Router();

router.get("/:teacherId/students", getTeacherStudents);

module.exports = router;