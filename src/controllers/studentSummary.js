const prisma = require("../config/db");
const { calculateDayAverage,
    calculateSubjectAverage,
    calculateOverallAverage
} = require("../services/marks.service");

const getStudentSummary = async (req, res) => {
    try {
        const { studentId, semesterId} = req.query;

        if(!studentId || !semesterId) {
            return res.status(400).json({
                success: false,
                message: "studentId and semesterId are required"
            });
        }

        const student = await prisma.student.findUnique({
            where: {
                id: Number(studentId)
            },
            select: {
                id: true,
                uid: true,
                name: true,
                batch: true,
                section: true,
                branchId: true 
            }
        });

        if(!student) {
            return res.status(400).json ({
                success: false,
                message: "Student not found"
            });
        }

        const markSessions = await prisma.markSession.findMany({
            where : {
                branchId: student.branchId,
                batch: student.batch,
                section: student.section,
                semesterId: Number(semesterId)
            },
            select: {
                id: true,
                subjectId: true,
                date: true,
                subject: {
                    
                        select:{
                    
                    id: true,
                    name: true  

                }
            },
            assessments: {
                where: {
                    studentId: student.id 
                },
                select: {
                    marks: true 
                }
                }
            },
              orderBy: {
                date: "asc"
            }
        }) ;

        const summary = {};
        const subjectMarks = {};

    

        markSessions.forEach((session)  => {
      const date = session.date
      .toISOString()
      .split("T")[0];

      if(!summary[date]) {
        summary[date] = {
            date,
            subjects: []
        };
      }

      const assessment = session.assessments[0];

      if(assessment) {
        const subjectId = session.subject.id;
        const marks = assessment.marks;

        summary[date].subjects.push({
            subjectId: session.subject.id,
            subjectName: session.subject.name,
            marks: assessment.marks
        });

        if(!subjectMarks[subjectId]) {
            subjectMarks[subjectId] = {
                subjectId,
                subjectName: session.subject.name,
                marks: []
            };
        }

        subjectMarks[subjectId].marks.push(marks)
      }

    });
     const subjectAverages = Object.values(subjectMarks).map((subject) => {
        return {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            average: calculateSubjectAverage(subject.marks)
        };
      });

      const overallAverage = calculateOverallAverage(
        subjectAverages.map((subject) => subject.average)
      );


    const dailySummary = Object.values(summary).map((day) => {
        return{
            ...day,
            dayAverage: calculateDayAverage(day.subjects)
        }
    })

    return res.status(200).json ({
        success: true,
        student,
        semesterId: Number(semesterId),
        summary: dailySummary,
        subjectAverages,
        overallAverage
    });
    }  catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load student summary"
        });
    }
};
 module.exports = {
    getStudentSummary
 };