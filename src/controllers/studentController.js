const prisma = require("../config/db")

const getStudents = async (req, res) => {
    try{
        const { branchId, semesterId, section } = req.query;

        const  students = await prisma.student.findMany({
            where: {
                branchId: Number(branchId),
                semesterId: Number(semesterId),
                section,
            },
            select: {
                id: true,
                uid: true,
                name: true,
                batch: true,
                section: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        res.status(200).json({
            success: true,
            count: students.length,
            students,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students"
        });
    }
};

module.exports = { getStudents,}