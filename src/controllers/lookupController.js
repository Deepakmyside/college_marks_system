const prisma = require("../config/db");

const getBranches = async (req, res) => {
    try {
        const branches = await prisma.branch.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: "asc"
            }
        });

        res.status(200).json({
            success: true,
            count: branches.length,
            branches
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch branches"
        });
    }
};

const getSemesters = async (req, res) => {
    try {
        const semesters = await prisma.semester.findMany({
            select: {
                id: true,
                number: true
            },
            orderBy: {
                number: "asc"
            }
        });

        res.status(200).json({
            success: true,
            count: semesters.length,
            semesters
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch semesters"
        });
    }
};

const getSections = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            select: {
                section: true
            },
            distinct: ["section"],
            orderBy: {
                section: "asc"
            }
        });

        const sections = students.map(student => student.section);

        res.status(200).json({
            success: true,
            count: sections.length,
            sections
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sections"
        });
    }
};

module.exports = {
    getBranches,
    getSemesters,
    getSections
};
