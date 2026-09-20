const express = require("express")

const { markSubmission } = require("../controllers/markSubmission")

const router = express.Router()

router.post("/", markSubmission)

module.exports = router;
