const express = require("express")
const authenticateToken = require("../middleware/auth.middleware");
const authorizeRole = require("../middleware/role.middleware")
const { markSubmission, getMarks } = require("../controllers/markSubmission")

const router = express.Router()

router.post("/", authenticateToken, authorizeRole("TEACHER"), markSubmission)

router.get("/", authenticateToken, authorizeRole("TEACHER"), getMarks)

module.exports = router;
