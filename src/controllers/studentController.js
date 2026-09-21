const prisma = require("../config/db")
const { getCurrentSemester} = require("../services/academic.service");

const getStudents = async (req, res) => {
    try{
        const { branchId, semesterId, section } = req.query;

        //    Find the semester selected by teacher

        const semester = await prisma.semester.findUnique({
            where: {
                id: Number(semesterId)
            }
        });

        if(!semester) {
            return res.status(400).json({
                success: false,
                message: "Invalid semester"
            });

            // Get all students from this branch and section 
        }
        const  students = await prisma.student.findMany({
            where: {
                branchId: Number(branchId),
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

         if (students.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                students: []
            })
        }
           // All students in same section have same batch
        // So calculate current semester once only — not in a loop
        const currentSemesterNumber = await getCurrentSemester(
            prisma,
            students[0].batch 
        );
        
        
        // Chcek if selected semester matches current academic period
        if (currentSemesterNumber !== semester.number) {
            return res.status(400).json({
                success: false,
                message: `Selected semester ${semester.number} doesn't match current academic semester ${currentSemesterNumber}`
            })
        }
       

        res.status(200).json({
            success: true,
            count: students.length,
            students: students,
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