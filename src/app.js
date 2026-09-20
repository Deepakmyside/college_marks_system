const express = require("express");
const cors = require("cors");

const app = express();

const studentRoutes = require("./routes/studentRoutes")
const subjectRoutes = require("./routes/subjectRoutes")
const markRoutes = require("./routes/markRoutes")
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        messsage: "collage Marks System API is running"
    });
});

app.use("/api/students", studentRoutes)
app.use("/api/subjects",subjectRoutes)
app.use("/api/marks", markRoutes)
module.exports = app;