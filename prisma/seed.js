const { PrismaClient } = require("../src/generated/prisma")

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database....");

    const aiml = await prisma.branch.upsert({
        where: {  name: "AIML" },
        update: {},
        create: {name: "AIML"}
    })

      const cse = await prisma.branch.upsert({
        where: {  name: "CSE" },
        update: {},
        create: {name: "CSE"}
    })

      const iot = await prisma.branch.upsert({
        where: {  name: "IOT" },
        update: {},
        create: {name: "IOT"}
    })


    const sem3 = await prisma.semester.upsert({
        where: { number: 3 },
        update: {},
        create: {number: 3 }
    })

    const sem4 = await prisma.semester.upsert({
        where: { number: 4 },
        update: {},
        create: {number: 4 }
    })
    
    const sem5 = await prisma.semester.upsert({
          where: { number: 5 },
          update: {},
          create: { number: 5 }
         });


    const odd2026 = await prisma.academicPeriod.upsert({
    where: {
        academicYear_term: {
            academicYear: "2026-27",
            term: "ODD"
        }
    },
    update: {},
    create: {
        academicYear: "2026-27",
        term: "ODD",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-12-31")
    }
    });

    const even2026 = await prisma.academicPeriod.upsert({
    where: {
        academicYear_term: {
            academicYear: "2026-27",
            term: "EVEN"
        }
    },
    update: {},
    create: {
        academicYear: "2026-27",
        term: "EVEN",
        startDate: new Date("2027-01-01"),
        endDate: new Date("2027-06-30")
    }
    });

    const teacher = await prisma.user.upsert({
        where: {email: "teacher@college.com"},
        update:{},
        create: {
            name: "Rahul Teacher",
            email:"teacher@college.com",
            passwordHash: "dummy-password",
            role: "TEACHER",
        }
    })

    const hod = await prisma.user.upsert({
        where: { email: "hod@college.com"},
        update:{},
        create: {
            name: "Amit HOD",
            email: "hod@college.com",
            passwordHash: "dummy-password",
            role: "HOD"
        }
    })

    console.log("User created.");

    const student1 = await prisma.student.upsert({
        where: { uid: "AIML001" },
        update: {},
        create: {
            uid : "AIML001",
            name: "Rahul tewatia",
            batch: "2024-28",
            section: "A",
            branchId: aiml.id,
        
        },
    });

    
    const student2 = await prisma.student.upsert({
           where: { uid: "AIML002" },
        update: {},
        create: {
            uid : "AIML002",
            name: "Aman tirth",
            batch: "2024-28",
            section: "A",
            branchId: aiml.id,

        },
    })

    const student3 = await prisma.student.upsert({
          where: { uid: "AIML003" },
        update: {},
        create: {
            uid: "AIML003",
            name: "Ajay bhandaria",
            batch: "2024-28",
            section: "A",
            branchId: cse.id,
          
        },
    });

    const student4 = await prisma.student.upsert({
            where: { uid: "CSE001" },
        update: {
            batch:"2025-29"},
        create: {
          uid: "CSE001",
          name: "Arjun Kumar",
          batch: "2025-29",
          section: "A",
          branchId: cse.id,
        
       },
    });
    
    console.log("stundents created");

    const dbms = await prisma.subject.create({
        data: {
            name: "DBMS",
            branchId: aiml.id,
            semesterId: sem4.id,
        },
    });

     const os = await prisma.subject.create({
        data: {
            name: "Operation Systems",
            branchId: aiml.id,
            semesterId: sem4.id,
        },
    });

    const maths = await prisma.subject.create({
        data: {
        name:"Mathematics",
        branchId: aiml.id,
        semesterId: sem4.id
        }
    });

   const csedbms = await  prisma.subject.create({
    data: {
        name: "DBMS",
        branchId: cse.id,
        semesterId: sem4.id
    },
   });

   const markSession = await prisma.markSession.create({
    data: {
        teacherId: teacher.id,
        subjectId: dbms.id,
        branchId: aiml.id,
        semesterId: sem5.id,
        batch: "2024-28",
        section: "A",
        date: new Date("2026-09-19"),  

    },
   });

   console.log("Mark session created")

 const assessments = await prisma.assessment.createMany({
    data: [
        {
            markSessionId: markSession.id,
            studentId: student1.id,
            marks: 8, 
        },
        {
            markSessionId: markSession.id,
            studentId: student2.id,
            marks:9,
        },
    ],
 });

   console.log(`${assessments.count} assessments created yoo boy`);
}

 

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  })
