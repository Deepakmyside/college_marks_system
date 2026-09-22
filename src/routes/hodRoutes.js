const express = require("express");
const { getHodDashboard} = require("../controllers/hodController");

const router = express.Router();

router.get("/dashboard", getHodDashboard);
module.exports = router;