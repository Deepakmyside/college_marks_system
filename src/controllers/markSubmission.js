const prisma = require("../config/db")
const {  getCurrentSemester} = require("../services/academic.service")
const markSubmission = async (req, res) => {
    try {

        // Get data sent by client 
        const{
            teacherId,
            subjectId,
           subjectGroupId,
            date,
            marks 
        }  = req.body;

        // Validation 1: Required fields 
        
        if (  !teacherId || !subjectId || !subjectGroupId || !date || !Array.isArray(marks) || marks.length === 0
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

const skillFields = [
    "communicationSkills",
    "technicalSkills",
    "behaviouralSkills",
    "softSkills"
];

const invalidMark = marks.find((item) => {
    if (!Number.isInteger(Number(item.studentId)) || Number(item.studentId) <= 0) {
        return true;
    }

    return skillFields.some((field) => {
        const value = item[field];

        return (
            typeof value !== "number" ||
            !Number.isFinite(value) ||
            value < 0 ||
            value > 10
        );
    });
});

if (invalidMark) {
    return res.status(400).json({
        success: false,
        message: "Each student must have a valid studentId and all four skill marks between 0 and 10"
    });
}


    // 1. Find the subject group
const group = await prisma.subjectGroup.findUnique({
    where: {
        id: Number(subjectGroupId)
    },
    include: {
        subject: true,
        academicPeriod: true,
        students: true
    }
});

if (!group) {
    return res.status(404).json({
        success: false,
        message: "Subject group not found"
    });
}

// 2. Verify that the group belongs to the requested subject
if (group.subjectId !== Number(subjectId)) {
    return res.status(400).json({
        success: false,
        message: "Subject does not match the assigned group"
    });
}

// 3. Verify teacher's assignment to this group
const assignment = await prisma.teacherGroupAssignment.findFirst({
    where: {
        subjectGroupId: Number(subjectGroupId),
        teacherSubjectAssignment: {
            teacherId: Number(teacherId),
            subjectId: Number(subjectId),
            academicPeriodId: group.academicPeriodId
        }
    }
});

if (!assignment) {
    return res.status(403).json({
        success: false,
        message: "You are not assigned to this subject group"
    });
}

// 4. Verify that every submitted student belongs to this group
const assignedStudentIds = new Set(
    group.students.map((membership) => membership.studentId)
);

const unauthorizedStudent = marks.find(
    (item) => !assignedStudentIds.has(Number(item.studentId))
);

if (unauthorizedStudent) {
    return res.status(403).json({
        success: false,
        message: "One or more students do not belong to your assigned group"
    });
}

   const sessionDate = new Date(date);

const existing = await prisma.markSession.findFirst({
    where: {
        subjectId: Number(subjectId),
        subjectGroupId: Number(subjectGroupId),
        academicPeriodId: group.academicPeriodId,
        date: sessionDate
    },
    include: {
        assessments: {
            include: {
                student: true
            }
        }
    }
});
if (existing) {
    return res.status(409).json({
        success: false,
        message: "Marks session already exists for this group and date",
        markSessionId: existing.id
    });
}
    
        // if already submitted, return existing marks
        // instead of creating duplicate session hehe

        // create ONE  MarkSession
       const markSession = await prisma.markSession.create({
    data: {
        teacherId: Number(teacherId),
        subjectId: Number(subjectId),
        branchId: group.subject.branchId,
        semesterId: group.subject.semesterId,
        academicPeriodId: group.academicPeriodId,
        assignmentId: assignment.teacherSubjectAssignmentId,
        subjectGroupId: group.id,
        batch: group.batch,
        section: group.section,
        date: sessionDate
    }
});
        // Convert marks array into Assessment objects 
   const assessments = marks.map((item) => ({
    markSessionId: markSession.id,
    studentId: Number(item.studentId),
    communicationSkills: item.communicationSkills,
    technicalSkills: item.technicalSkills,
    behaviouralSkills: item.behaviouralSkills,
    softSkills: item.softSkills
}));

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