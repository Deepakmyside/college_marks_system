const express = require('express')

const { getSubjects } = require("../controllers/subjectController")
const router = express.Router()

router.get("/", getSubjects)
module.exports = router;