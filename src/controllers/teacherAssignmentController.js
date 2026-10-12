const { assignTeacherToSubject,} = require("../services/teacherAssignment.service")

const createAssignment = async (req, res) => {
    try {
        const assignment = await assignTeacherToSubject(req.body);
        return res.status(201).json({
            success: true,
            message: "Teacher assigned successfully",
            data: assignment,
        });
    }catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { createAssignment}