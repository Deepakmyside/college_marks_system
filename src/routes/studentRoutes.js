
const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const {getStudents} = require("../controllers/studentController");
const {getStudentSummary} = require("../controllers/studentSummary")

const router = express.Router();

router.get("/", authenticateToken, getStudents);
router.get("/:id/summary", authenticateToken, getStudentSummary);

module.exports = router;
