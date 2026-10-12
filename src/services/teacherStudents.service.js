const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

const getAssignedStudents = async (teacherId) => {
  const id = Number(teacherId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid teacher ID");
  }

  // Check whether the teacher exists
  const teacher = await prisma.user.findUnique({
    where: { id },
  });

  if (!teacher || teacher.role.toUpperCase() !== "TEACHER") {
    throw new Error("Teacher not found");
  }

  // Fetch only groups assigned to this teacher
  const assignments = await prisma.teacherSubjectAssignment.findMany({
    where: {
      teacherId: id,
    },
    include: {
      subject: {
        include: {
          branch: true,
          semester: true,
        },
      },
      academicPeriod: true,
      groups: {
        include: {
          subjectGroup: {
            include: {
              students: {
                include: {
                  student: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Return students grouped by subject and academic period
  const result = assignments.flatMap((assignment) =>
    assignment.groups.map(({ subjectGroup }) => ({
      assignmentId: assignment.id,

      subject: assignment.subject,

      academicPeriod: assignment.academicPeriod,

      group: {
        id: subjectGroup.id,
        name: subjectGroup.name,
        batch: subjectGroup.batch,
        section: subjectGroup.section,
      },

      students: subjectGroup.students.map(({ student }) => ({
        id: student.id,
        uid: student.uid,
        name: student.name,
        batch: student.batch,
        section: student.section,
        branchId: student.branchId,
      })),
    }))
  );

  return result;
};

module.exports = { getAssignedStudents };
