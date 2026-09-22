const prisma = require("../config/db")
const { getBatchForSemester } = require("../services/academic.service");

const getHodDashboard = async (req, res) => {
    try {
         const {
            branchId,
            semesterId,
            section
         } = req.query;

         if(!branchId || !semesterId || !section) {
            return res.status(400).json({
                success: false,
                message: "branchId, semesterId and section are required"
            });
         }


        //  Find selected semester

        const semester = await prisma.semester.findUnique({
            where: {
                id: Number(semesterId)
            }
        });

        if(!semester) {
            return res.status(400).json({
                success: false,
                messag: "Invalid semester"
            });
        }


    //  Find current academic period

    const currentDate = new Date();

    const academicPeriod = await prisma.academicPeriod.findFirst({
        where: {
            startDate: {
                lte: currentDate
            },
            endDate: {
                gte: currentDate
            }
        }
    });

    if(!academicPeriod) {
        return res.status(400).json({
            success: false,
            message: "No active academic period found"
        });
    }

    // Calculate batch

    const batch = getBatchForSemester(
        semester.number,
        academicPeriod
    );


    // Get students

    const students = await prisma.student.findMany({
        where: {
            branchId: Number(branchId),
            batch,
            section
        },
        select: {
            id: true,
            uid: true,
            name: true,
            batch : true,
            section : true
        },
        orderBy: {
            name: "asc"
        }
    });

    // Get all subjects 
    //  for branch + semester


    const subjects = await prisma.subject.findMany({
        where: {
            branchId:  Number(branchId),
            semesterId: Number(semesterId)
        },
        select: {
            id: true,
            name:true
        },
        orderBy:{
            id: "asc"
        }
    });


    // Get all marks sessions
    // for this batch/section


    const markSessions = await prisma.markSession.findMany({
        where: {
            branchId: Number(branchId),
            semesterId: Number(semesterId),
            batch,
            section
        },
        select: {
            id: true,
            subjectId:true,
            date: true,
            assessments: {
                select: {
                    studentId: true,
                    marks: true 
                }
            }
        },
        orderBy: {
            date: "asc"
        }
    });
// Return dashboard data

    return res.status(200).json({
        success: true,

        filters: {
            academicYear: academicPeriod.academicYear,
            term: academicPeriod.term,
            branchId: Number(branchId),
            semesterId: Number(semesterId),
            semester: semester.number,
            batch,
            section
        },
        subjects,
        students,
        markSessions
    });
    }  catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load HOD dashboard"
        })
    }
};

module.exports = {
    getHodDashboard
};