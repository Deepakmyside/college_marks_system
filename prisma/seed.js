
const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Branches
  const aiml = await prisma.branch.upsert({
    where: { name: "AIML" },
    update: {},
    create: { name: "AIML" },
  });

  const cse = await prisma.branch.upsert({
    where: { name: "CSE" },
    update: {},
    create: { name: "CSE" },
  });

  await prisma.branch.upsert({
    where: { name: "IOT" },
    update: {},
    create: { name: "IOT" },
  });

  // 2. Semesters
  const sem3 = await prisma.semester.upsert({
    where: { number: 3 },
    update: {},
    create: { number: 3 },
  });

  const sem4 = await prisma.semester.upsert({
    where: { number: 4 },
    update: {},
    create: { number: 4 },
  });

  const sem5 = await prisma.semester.upsert({
    where: { number: 5 },
    update: {},
    create: { number: 5 },
  });

  // 3. Academic periods
  const odd2026 = await prisma.academicPeriod.upsert({
    where: {
      academicYear_term: {
        academicYear: "2026-27",
        term: "ODD",
      },
    },
    update: {},
    create: {
      academicYear: "2026-27",
      term: "ODD",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-12-31"),
    },
  });

  const even2026 = await prisma.academicPeriod.upsert({
    where: {
      academicYear_term: {
        academicYear: "2026-27",
        term: "EVEN",
      },
    },
    update: {},
    create: {
      academicYear: "2026-27",
      term: "EVEN",
      startDate: new Date("2027-01-01"),
      endDate: new Date("2027-06-30"),
    },
  });

  // 4. Users
  async function upsertUser(name, email, role) {
    return prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: {
        name,
        email,
        role,
        // Dummy password only. Replace with a real password hash
        // before using these accounts for authentication.
        passwordHash: "dummy-password",
      },
    });
  }

  const rahul = await upsertUser(
    "Rahul Teacher",
    "teacher@college.com",
    "TEACHER"
  );

  const hod = await upsertUser(
    "Amit HOD",
    "hod@college.com",
    "HOD"
  );

  const kashish = await upsertUser(
    "Kashish Garg",
    "kashish@college.com",
    "TEACHER"
  );

  const priya = await upsertUser(
    "Priya Sharma",
    "priya@college.com",
    "TEACHER"
  );

  const neha = await upsertUser(
    "Neha Verma",
    "neha@college.com",
    "TEACHER"
  );

  console.log("Users created.");

  // 5. Students
  async function upsertStudent({
    uid,
    name,
    batch,
    section,
    branchId,
  }) {
    return prisma.student.upsert({
      where: { uid },
      update: { name, batch, section, branchId },
      create: {
        uid,
        name,
        batch,
        section,
        branchId,
      },
    });
  }

  const student1 = await upsertStudent({
    uid: "AIML001",
    name: "Rahul Tewatia",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student2 = await upsertStudent({
    uid: "AIML002",
    name: "Aman Tirth",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student3 = await upsertStudent({
    uid: "AIML003",
    name: "Ajay Bhandaria",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student4 = await upsertStudent({
    uid: "CSE001",
    name: "Arjun Kumar",
    batch: "2025-29",
    section: "A",
    branchId: cse.id,
  });

  // Additional students for other subject-specific groups
  const student5 = await upsertStudent({
    uid: "AIML005",
    name: "Simran Kaur",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student6 = await upsertStudent({
    uid: "AIML006",
    name: "Harpreet Singh",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student7 = await upsertStudent({
    uid: "AIML007",
    name: "Manpreet Kaur",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student8 = await upsertStudent({
    uid: "AIML008",
    name: "Gurpreet Singh",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student9 = await upsertStudent({
    uid: "AIML009",
    name: "Karan Sharma",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  const student10 = await upsertStudent({
    uid: "AIML010",
    name: "Jaspreet Kaur",
    batch: "2024-28",
    section: "A",
    branchId: aiml.id,
  });

  // 6. Subjects: upsert prevents duplicate subjects
  async function upsertSubject(name, branchId, semesterId) {
    return prisma.subject.upsert({
      where: {
        name_branchId_semesterId: {
          name,
          branchId,
          semesterId,
        },
      },
      update: {},
      create: { name, branchId, semesterId },
    });
  }

  const dbms = await upsertSubject("DBMS", aiml.id, sem5.id);
  const os = await upsertSubject(
    "Operating Systems",
    aiml.id,
    sem5.id
  );
  const maths = await upsertSubject(
    "Mathematics",
    aiml.id,
    sem5.id
  );
  const physics = await upsertSubject(
    "Physics",
    aiml.id,
    sem5.id
  );
  const cseDbms = await upsertSubject(
    "DBMS",
    cse.id,
    sem4.id
  );

  // 7. Subject groups
  async function upsertGroup({
    name,
    subjectId,
    academicPeriodId,
    batch,
    section,
  }) {
    return prisma.subjectGroup.upsert({
      where: {
        subjectId_academicPeriodId_batch_section: {
          subjectId,
          academicPeriodId,
          batch,
          section,
        },
      },
      update: { name },
      create: {
        name,
        subjectId,
        academicPeriodId,
        batch,
        section,
      },
    });
  }

  const dbmsGroup = await upsertGroup({
    name: "DBMS Group A",
    subjectId: dbms.id,
    academicPeriodId: odd2026.id,
    batch: "2024-28",
    section: "A",
  });

  const osGroup = await upsertGroup({
    name: "OS Group A",
    subjectId: os.id,
    academicPeriodId: odd2026.id,
    batch: "2024-28",
    section: "A",
  });

  const mathsGroup = await upsertGroup({
    name: "Mathematics Group A",
    subjectId: maths.id,
    academicPeriodId: odd2026.id,
    batch: "2024-28",
    section: "A",
  });

  const physicsGroup = await upsertGroup({
    name: "Physics Group A",
    subjectId: physics.id,
    academicPeriodId: odd2026.id,
    batch: "2024-28",
    section: "A",
  });

  const cseDbmsGroup = await upsertGroup({
    name: "CSE DBMS Group A",
    subjectId: cseDbms.id,
    academicPeriodId: even2026.id,
    batch: "2025-29",
    section: "A",
  });

  // 8. Student-group memberships
  // One student can belong to only one group per academic period.
  async function addStudentToGroup(student, group) {
    return prisma.subjectGroupStudent.upsert({
      where: {
        studentId_academicPeriodId: {
          studentId: student.id,
          academicPeriodId: group.academicPeriodId,
        },
      },
      update: {
        subjectGroupId: group.id,
      },
      create: {
        studentId: student.id,
        subjectGroupId: group.id,
        academicPeriodId: group.academicPeriodId,
      },
    });
  }

  // DBMS group: AIML001, AIML002
  await addStudentToGroup(student1, dbmsGroup);
  await addStudentToGroup(student2, dbmsGroup);

  // OS group: AIML005, AIML006
  await addStudentToGroup(student5, osGroup);
  await addStudentToGroup(student6, osGroup);

  // Mathematics group: AIML007, AIML008
  await addStudentToGroup(student7, mathsGroup);
  await addStudentToGroup(student8, mathsGroup);

  // Physics group: AIML009, AIML010
  await addStudentToGroup(student9, physicsGroup);
  await addStudentToGroup(student10, physicsGroup);

  // CSE DBMS group in the EVEN period
  await addStudentToGroup(student4, cseDbmsGroup);

  console.log("Subject groups and memberships created.");

  // 9. Teacher-subject and teacher-group assignments
  async function assignTeacherToGroup(teacher, subject, period, group) {
    const assignment =
      await prisma.teacherSubjectAssignment.upsert({
        where: {
          teacherId_academicPeriodId: {
            teacherId: teacher.id,
            academicPeriodId: period.id,
          },
        },
        update: {
          subjectId: subject.id,
        },
        create: {
          teacherId: teacher.id,
          subjectId: subject.id,
          academicPeriodId: period.id,
        },
      });

    await prisma.teacherGroupAssignment.upsert({
      where: {
        subjectGroupId: group.id,
      },
      update: {
        teacherSubjectAssignmentId: assignment.id,
      },
      create: {
        teacherSubjectAssignmentId: assignment.id,
        subjectGroupId: group.id,
      },
    });

    return assignment;
  }

  const dbmsAssignment = await assignTeacherToGroup(
    rahul,
    dbms,
    odd2026,
    dbmsGroup
  );

  await assignTeacherToGroup(
    priya,
    os,
    odd2026,
    osGroup
  );

  await assignTeacherToGroup(
    neha,
    maths,
    odd2026,
    mathsGroup
  );

  const physicsAssignment = await assignTeacherToGroup(
    kashish,
    physics,
    odd2026,
    physicsGroup
  );

  // Same teacher can have a different-period assignment.
  await assignTeacherToGroup(
    rahul,
    cseDbms,
    even2026,
    cseDbmsGroup
  );

  console.log("Teacher assignments created.");

  // 10. DBMS assessment session
  const assessmentDate = new Date("2026-09-19");

  const markSession = await prisma.markSession.upsert({
    where: {
      subjectId_branchId_semesterId_batch_section_date: {
        subjectId: dbms.id,
        branchId: aiml.id,
        semesterId: sem5.id,
        batch: "2024-28",
        section: "A",
        date: assessmentDate,
      },
    },
    update: {
      teacherId: rahul.id,
      academicPeriodId: odd2026.id,
      assignmentId: dbmsAssignment.id,
      subjectGroupId: dbmsGroup.id,
    },
    create: {
      teacherId: rahul.id,
      subjectId: dbms.id,
      branchId: aiml.id,
      semesterId: sem5.id,
      academicPeriodId: odd2026.id,
      assignmentId: dbmsAssignment.id,
      subjectGroupId: dbmsGroup.id,
      batch: "2024-28",
      section: "A",
      date: assessmentDate,
    },
  });

  // 11. Four skill marks per student
  async function upsertAssessment(student, marks) {
    return prisma.assessment.upsert({
      where: {
        markSessionId_studentId: {
          markSessionId: markSession.id,
          studentId: student.id,
        },
      },
      update: marks,
      create: {
        markSessionId: markSession.id,
        studentId: student.id,
        ...marks,
      },
    });
  }

  await upsertAssessment(student1, {
    communicationSkills: 8,
    technicalSkills: 9,
    behaviouralSkills: 7,
    softSkills: 8,
  });

  await upsertAssessment(student2, {
    communicationSkills: 9,
    technicalSkills: 8,
    behaviouralSkills: 9,
    softSkills: 8,
  });

  console.log("Seed completed successfully!");
  console.log("Kashish Garg → Physics → Physics Group A");
  console.log("Teacher ID:", kashish.id);
  console.log("Physics subject ID:", physics.id);
  console.log("Physics group ID:", physicsGroup.id);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
