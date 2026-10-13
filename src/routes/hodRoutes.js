const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware")
const { getHodDashboard} = require("../controllers/hodController");
const { getStudentSummary} = require("../controllers/studentSummary");
const router = express.Router();

router.get("/dashboard", authenticateToken, authorizeRole("HOD"), getHodDashboard);
router.get("/student-summary",  authenticateToken, authorizeRole("HOD"),getStudentSummary);
module.exports = router;