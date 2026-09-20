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

        // create ONE  MarkSession
        const markSession = await prisma.markSession.create({
            data: {
                teacherId,
                subjectId,
                branchId,
                semesterId,
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

        // Create all assessments
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

module.exports= {
    markSubmission
};