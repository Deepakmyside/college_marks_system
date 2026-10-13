const cron = require("node-cron")
const prisma = require("../config/db")

const createAcademicPeriod = async (term, academicYear, startDate, endDate) => {
    const existing = await prisma.academicPeriod.findFirst({
        where: { academicYear, term }
    })

    if (existing) {
        console.log(`Academic period ${academicYear} ${term} already exists`)
        return
    }

    await prisma.academicPeriod.create({
        data: {
            academicYear,
            term,
            startDate,
            endDate
        }
    })

    console.log(`Created academic period: ${academicYear} ${term}`)
}

const scheduleAcademicPeriods = () => {

    // Runs every year on July 1st at midnight → ODD semester starts
    cron.schedule("0 0 1 7 *", async () => {
        const now = new Date()
        const year = now.getFullYear()
        const academicYear = `${year}-${year + 1}`

        await createAcademicPeriod(
            "ODD",
            academicYear,
            new Date(`${year}-07-01`),
            new Date(`${year}-12-31`)
        )
    })

    // Runs every year on January 1st at midnight → EVEN semester starts
    cron.schedule("0 0 1 1 *", async () => {
        const now = new Date()
        const year = now.getFullYear()
        const academicYear = `${year - 1}-${year}`

        await createAcademicPeriod(
            "EVEN",
            academicYear,
            new Date(`${year}-01-01`),
            new Date(`${year}-06-30`)
        )
    })

    console.log("Academic period scheduler running...")
}

module.exports = { scheduleAcademicPeriods }