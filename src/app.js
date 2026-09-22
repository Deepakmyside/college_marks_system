const express = require("express");
const cors = require("cors");

const app = express();

const studentRoutes = require("./routes/studentRoutes")
const subjectRoutes = require("./routes/subjectRoutes")
const markRoutes = require("./routes/markRoutes")
const hodRoutes = require("./routes/hodRoutes");
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
app.use("/api/hod", hodRoutes)
module.exports = app;