const express = require("express");
const { getHodDashboard} = require("../controllers/hodController");
const { getStudentSummary} = require("../controllers/studentSummary");
const router = express.Router();

router.get("/dashboard", getHodDashboard);
router.get("/student-summary", getStudentSummary);
module.exports = router;