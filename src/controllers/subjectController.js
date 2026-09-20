const prisma = require("../config/db")

const getSubjects = async (req, res) => {
    try{

        const {branchId, semesterId} = req.query;
        const subjects = await prisma.subject.findMany({
            where: {
                branchId: Number(branchId),
                semesterId: Number(semesterId)
            },
            select: {
                id: true,
                name: true
            }
        });
        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load subjects "
        });
    }
};

module.exports = { getSubjects,}