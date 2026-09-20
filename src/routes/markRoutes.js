const express = require("express")

const { markSubmission, getMarks } = require("../controllers/markSubmission")

const router = express.Router()

router.post("/", markSubmission)
router.get("/", getMarks)

module.exports = router;
