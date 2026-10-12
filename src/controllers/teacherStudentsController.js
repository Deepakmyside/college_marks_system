const {
  getAssignedStudents,
} = require("../services/teacherStudents.service");

const getTeacherStudents = async (req, res) => {
  try {
    const students = await getAssignedStudents(
      req.params.teacherId
    );

    return res.status(200).json({
      success: true,
      count: students.reduce(
        (total, group) => total + group.students.length,
        0
      ),
      data: students,
    });
  } catch (error) {
    console.error("Get assigned students error:", error);

    const status = error.message === "Teacher not found" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message || "Failed to fetch assigned students",
    });
  }
};

module.exports = { getTeacherStudents };
