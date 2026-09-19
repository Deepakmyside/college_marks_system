const express = require('express')

const { getStudents } = require("../controllers/studentController")
const router = express.Router()

router.get("/", getStudents)
module.exports = router;