const express = require("express");
const cors = require("cors");

const app = express();

const studentRoutes = require("./routes/studentRoutes")

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        messsage: "collage Marks System API is running"
    });
});

app.use("/api/students", studentRoutes)

module.exports = app;