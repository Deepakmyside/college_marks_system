const express = require("express");
const router = express.Router();

const { createAssignment} = require("../controllers/teacherAssignmentController")

router.post("/", createAssignment);
module.exports = router;