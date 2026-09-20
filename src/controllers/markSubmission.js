const prisma = require("../config/db")

const markSubmission = async (req, res) => {
    try {

        // Get data sent by client 
        const{
            teacherId,
            subjectId,
            branchId,
            semesterId,
            section,
            date,
            marks 
        }  = req.body;

        // Validation 1: Required fields 
        
        if (  !teacherId || !subjectId || !branchId || !semesterId || !section || !date || !marks 
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields required: teacherId, subjectId, branchId, semesterId, section, date, marks"
            });
        }

        // Validate 2: marks must be a non-empty array

        if(!Array.isArray(marks) || marks.length === 0 ) {
            return res.status(400).json({
                success: false,
                message: "marks must  be a non-empty array"
            });
        }

        // Validate 3: Every mark must be between 0-10

        const invalidMark = marks.find(
            (item) => 
                typeof item.marks !== " number" ||
            item.marks < 0 || item.marks > 10
        );

        if (invalidMark) {
            return res.status(400).json({
                success: false,
                message: "Each mark must be number between 0 and 10"
            });
        }

        // Checking if this markSession already exists

        const existing = await prisma.markSession.findFirst({
            where: {
                subjectId: Number(subjectId),
                branchId: Number(branchId),
                semesterId: Number(semesterId),
                section,
                date: new Date(date)
            },
            include: { 
                assessments: {
                    include: {
                        student: true
                    }
                }
            }
        });

        // if already submitted, return existing marks
        // instead of creating duplicate session hehe

        // create ONE  MarkSession
        const markSession = await prisma.markSession.create({
            data: {
                teacherId: Number(teacherId),
                subjectId: Number(subjectId),
                branchId:  Number(branchId),
                semesterId: Number(semesterId),
                section,
                date: new Date(date)
            }
        });

        // Convert marks array into Assessment objects 
        const assessments = marks.map((item) => {
            return {
                markSessionId: markSession.id,
                studentId: item.studentId,
                marks: item.marks 
            };
        });

        // Create all assessments Records
        const createdAssessments = await prisma.assessment.createMany({
            data: assessments
        });

        res.status(201).json({
            success:true,
            message: "Marks submitted successfully",
            markSessionId:markSession.id,
            assessmentCreated: createdAssessments.count 
        });

    }catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message:"Failed to submit marks"
        });
    }
}

const getMarks = async (req, res) => {
    try {
        const {
            subjectId,
            branchId,
            semesterId,
            section,
            date
        } = req.query;

        if( !subjectId || !branchId || !semesterId || !section || !date ){
            return res.status(400).json ({
                success: false,
                message:   "All query params required: subjectId, branchId, semesterId, section, date"
            
            });
        }

        // Find the MarkSession
        const markSession = await prisma.markSession.findFirst({
            where: {
                subjectId: Number(subjectId),
                branchId: Number(branchId),
                semesterId: Number(semesterId),
                section: section,
                date: new Date(date)
            },
            // Also bring  assessments and students

            include: {
                assessments: {
                    include: {
                        student: true
                    }
                }
            }
        });

// send existing marks

        res.status(200).json({
            success: true,
            markSession
        });

    } catch(error) {
        console.error(error);
        
        res.status(500).json ({
            success: false,
            message: "Failed to fetch marks"
        })
    }
}

module.exports= {
    markSubmission, getMarks
};