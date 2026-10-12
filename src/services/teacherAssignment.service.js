const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

const assignTeacherToSubject = async ({
  teacherId,
  subjectId,
  academicPeriodId,
  batch,
  section,
}) => {
  if (
    !teacherId ||
    !subjectId ||
    !academicPeriodId ||
    !batch ||
    !section
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

  // Only one teacher can be assigned to this subject group.
  const existingGroupAssignment =
    await prisma.teacherSubjectAssignment.findFirst({
      where: {
        subjectId: Number(subjectId),
        academicPeriodId: Number(academicPeriodId),
        batch,
        section,
      },
    });

  if (existingGroupAssignment) {
    throw new Error(
      "This subject already has a teacher assigned to this group"
    );
  }

  return prisma.teacherSubjectAssignment.create({
    data: {
      teacherId: Number(teacherId),
      subjectId: Number(subjectId),
      academicPeriodId: Number(academicPeriodId),
      batch,
      section,
    },
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
      subject: true,
      AcademicPeriod: true,
    },
  });
};

module.exports = { assignTeacherToSubject };
