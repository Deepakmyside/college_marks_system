const { prismaClient } = require("@prisma/client")

const prisma = new prismaClient();

async function main() {
    console.log("Seeding database....");

    const aiml = await prisma.branch.create({
        data: {
            name: "AIML",
        }
    })

     const cse = await prisma.branch.create({
        data: {
            name: "CSE",
        }
    })

     const iot = await prisma.branch.create({
        data: {
            name: "IOT",
        }
    })

    const sem3 = await prisma.branch.create({
        data:{
            number: 3,
        }
    })

     const sem4 = await prisma.branch.create({
        data:{
            number: 4,
        }
    })


    const teacher = await prisma.branch.create({
        data: {
            name: "Rahul Teacher",
            email:"teacher@college.com",
            passwordHash: "dummy-password",
            role: "TEACHER",
        }
    }),

    const hod = await prisma.branch.create({
        data: {
            name: "Amit HOD",
            email: "hod@college.com",
            passwordHash: "dummy-password",
            role: "HOD"
        }
    })

    console.log("User created.");

    const student1 = await prisma.student.create({
        data: {
            uid : "AIML001",
            name: "Rahul tewatia",
            batch: "2024-28",
            section: "A",
            branchId: aiml.id,
            semesterId: sem4.id
        },
    });

    
    const student2 = await prisma.student.create({
        data: {
            uid : "AIML002",
            name: "Aman tirth",
            batch: "2024-28",
            section: "A",
            branchId: aiml.id,
            semesterId: sem4.id
        },
    })

    const student3 = await prisma.student.create({
        data: {
            uid: "AIML003",
            name: "Ajay bhandaria",
            batch: "2024-28",
            section: "A",
            branchId: cse.id,
            semesterId:sem4.id
        },
    });

    const student4 = await prisma.student.create({
          data: {
          uid: "CSE001",
          name: "Arjun Kumar",
          batch: "2024-28",
          section: "A",
          branchId: cse.id,
          semesterId: sem4.id,
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
        };
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
        semesterId: sem4.id,
        section: "A",
        date: new Date("2026-09-19"),  

    },
   });

   console.log("Mark session created")

 const assessments = await prisma.assessment.create({
    data: [
        {
            markSessionId: markSession.id,
            studentId: student1.id,
            marks: 8, 
        },
        {
            markSessionId: markSession.id,
            studentId: student1,
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
