const { assignTeacherToSubject, getTeacherAssignment} = require("../services/teacherAssignment.service")

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
const getMyAssignments = async (req , res) => {
    try {
        const assignments = await getTeacherAssignment(req.params.teacherId);

        return res.status(200).json({
            success: true,
            data: assignments,
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.messsage,
        });
    }
}; 


module.exports = { createAssignment, getMyAssignments}