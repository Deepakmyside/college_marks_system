const getCurrentSemester = async (prisma, batch, date = new Date())  => {
    // Find the academic period in which this date falls 
    const periods = await prisma.academicPeriod.findMany({
        where: {
            startDate: {
                lte: date
            },
            endDate: {
                gte: date
            }
        },
      
    });
   
    // No academic period means collage calendar is missing
    if(periods.length === 0 ) {
        throw new Error("No academic period found for this date");
     }

    // we expect only one activeacademic period
    const period = periods[0];
    console.log("Academic period:", period);


    // Get the starting year from student's batch example : "2024-28" => 2024
    const batchStartYear = Number(batch.split("-")[0]);


    // Get the starting year from acedemicYear
    const academicStartYear = Number(period.academicYear.split("-")[0]
    );


    //  Find how many academic years the batch has progressed example : 2026 - 2024 = 2
    const yearDifference = academicStartYear - batchStartYear;
    

    // Calculate semester based on ODD / EVEN period
    let semesterNumber;

    if(period.term === "ODD") {
        semesterNumber = 1 + (yearDifference * 2);
    }else if (period.term === "EVEN") {
        semesterNumber = 2 + (yearDifference * 2);
    } else {
        throw new Error("Invalid academic  period term");
    }

    // Make sure semester is within normal BTech range
     if(semesterNumber < 1 || semesterNumber > 8) {
        throw new Error("Batch is outside the active academic semester")
     }


    //  Return the calculated semester number
    return semesterNumber;
};

const getBatchForSemester = (semesterNumber, academicPeriod) => {
    const academicStartYear = Number(
        academicPeriod.academicYear.split("-")[0]
    );
    let yearDifference;
    
    if(academicPeriod.term === "ODD") {
        yearDifference = (semesterNumber  - 1) / 2;
    } else  if (academicPeriod.term === "EVEN") {
        yearDifference = (semesterNumber -2 ) / 2;
    } else {
        throw new Error("Invalid academic period term");
    }

    if(!Number.isInteger(yearDifference) || yearDifference < 0){
        throw new Error("Invalid semester for this academic period");
    }
    const batchStartYear = academicStartYear - yearDifference;

    const batchEndYear = batchStartYear + 4;
    return `${batchStartYear}-${String(batchEndYear).slice(-2)}`;
};
module.exports = {
    getCurrentSemester, getBatchForSemester
};