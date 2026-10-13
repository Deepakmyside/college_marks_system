const express = require("express");
const cors = require("cors");

const app = express();
const teacherAssignmentRoutes = require("./routes/teacherAssignmentRoutes")
const studentRoutes = require("./routes/studentRoutes")
const subjectRoutes = require("./routes/subjectRoutes")
const markRoutes = require("./routes/markRoutes")
const hodRoutes = require("./routes/hodRoutes");
const lookupRoutes = require("./routes/lookupRoutes");
const teacherStudentsRoutes = require("./routes/teacherStudentsRoutes")
const { scheduleAcademicPeriods } = require("./services/academicPeriod.service")
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        messsage: "collage Marks System API is running"
    });
});
scheduleAcademicPeriods()
app.use("/api/students", studentRoutes)
app.use("/api/subjects",subjectRoutes)
app.use("/api/marks", markRoutes)
app.use("/api/hod", hodRoutes)
app.use("/api/lookup", lookupRoutes)
app.use("/api/teacher-assignments", teacherAssignmentRoutes);
app.use("/api/teachers", teacherStudentsRoutes)
module.exports = app;