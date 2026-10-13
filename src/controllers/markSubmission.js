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
    subject: {
        include: {
            semester: true
        }
    },
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


// Calculate the semester based on the student's batch and date
const firstStudent = await prisma.student.findUnique({
    where: {
        id: Number(marks[0].studentId)
    }
});

if (!firstStudent) {
    return res.status(400).json({
        success: false,
        message: "Student not found"
    });
}

const currentSemesterNumber = await getCurrentSemester(
    prisma,
    firstStudent.batch,
    new Date(date)
);

// Check whether the group belongs to the current semester
if (group.subject.semester.number !== currentSemesterNumber) {
    return res.status(400).json({
        success: false,
        message: `This student belongs to Semester ${currentSemesterNumber}, but the selected group belongs to Semester ${group.subject.semester.number}`
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
    return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "Marks already submitted for this session",
        markSession: existing
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
        const { subjectId, subjectGroupId, date } = req.query;

        // Validation
        if (!subjectId || !subjectGroupId || !date) {
            return res.status(400).json({
                success: false,
                message: "subjectId, subjectGroupId and date are required"
            });
        }

        // Find the MarkSession
        const markSession = await prisma.markSession.findFirst({
            where: {
                subjectId: Number(subjectId),
                subjectGroupId: Number(subjectGroupId),
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

        // 404 if not found
        if (!markSession) {
            return res.status(404).json({
                success: false,
                message: "No marks found for this session"
            });
        }

        res.status(200).json({
            success: true,
            markSession
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
                message: "Failed to fetch marks"
        });
    }
}

module.exports= {
    markSubmission, getMarks
};