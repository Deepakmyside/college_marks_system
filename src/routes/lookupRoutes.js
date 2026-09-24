const express = require('express');

const { getBranches, getSemesters, getSections } = require("../controllers/lookupController");
const router = express.Router();

router.get("/branches", getBranches);
router.get("/semesters", getSemesters);
router.get("/sections", getSections);

module.exports = router;
