
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const assignTeacherToSubject = async ({
  teacherId,
  subjectId,
  academicPeriodId,
  subjectGroupId,
}) => {
  if (
    !teacherId ||
    !subjectId ||
    !academicPeriodId ||
    !subjectGroupId
  ) {
    throw new Error("All assignment fields are required");
  }

  const teacher = await prisma.user.findUnique({
    where: { id: Number(teacherId) },
  });

  if (!teacher || teacher.role.toUpperCase() !== "TEACHER") {
    throw new Error("Invalid teacher");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: Number(subjectId) },
  });

  if (!subject) {
    throw new Error("Subject not found");
  }

  const period = await prisma.academicPeriod.findUnique({
    where: { id: Number(academicPeriodId) },
  });

  if (!period) {
    throw new Error("Academic period not found");
  }

  const group = await prisma.subjectGroup.findUnique({
    where: { id: Number(subjectGroupId) },
  });

  if (!group) {
    throw new Error("Subject group not found");
  }

  if (
    group.subjectId !== Number(subjectId) ||
    group.academicPeriodId !== Number(academicPeriodId)
  ) {
    throw new Error(
      "Subject group does not match the subject or academic period"
    );
  }

  // A teacher can teach only one distinct subject per academic period.
  const existingTeacherAssignment =
    await prisma.teacherSubjectAssignment.findFirst({
      where: {
        teacherId: Number(teacherId),
        academicPeriodId: Number(academicPeriodId),
        NOT: {
          subjectId: Number(subjectId),
        },
      },
    });

  if (existingTeacherAssignment) {
    throw new Error(
      "This teacher is already assigned to another subject in this academic period"
    );
  }

  // A subject group can have only one assigned teacher.
  const existingGroupAssignment =
    await prisma.teacherGroupAssignment.findUnique({
      where: {
        subjectGroupId: Number(subjectGroupId),
      },
    });

  if (existingGroupAssignment) {
    throw new Error(
      "This subject group already has a teacher assigned"
    );
  }

  // Create the teacher-subject assignment and group link together.
  return prisma.teacherSubjectAssignment.create({
    data: {
      teacherId: Number(teacherId),
      subjectId: Number(subjectId),
      academicPeriodId: Number(academicPeriodId),

      groups: {
        create: {
          subjectGroupId: Number(subjectGroupId),
        },
      },
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subject: true,
      academicPeriod: true,
      groups: {
        include: {
          subjectGroup: true,
        },
      },
    },
  });
};

const getTeacherAssignment = async (teacherId) => {
  const assignments =
    await prisma.teacherSubjectAssignment.findMany({
      where: {
        teacherId: Number(teacherId),
      },
      include: {
        subject: true,
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

  return assignments;
};

module.exports = {
  assignTeacherToSubject,
  getTeacherAssignment,
};
