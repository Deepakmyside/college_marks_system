const calculateAverage = (marks) => {
    if(!marks || marks.length === 0) {
        return 0;
    }

    const total = marks.reduce((sum, mark) => sum + mark, 0);

    return total/ marks.length;
};

const calculateAssessmentAverage = (assessment) => {
    const scores = [
        assessment.communicationSkills,
        assessment.technicalSkills,
        assessment.behaviouralSkills,
        assessment.softSkills
    ].filter((score) => typeof score === "number" && Number.isFinite(score));

    return calculateAverage(scores);
};

const calculateDayAverage = (subjects) => {
    const marks = subjects.map((subject) => subject.marks);

    return calculateAverage(marks);
};

const calculateSubjectAverage = (subjectMarks) => {
    return calculateAverage(subjectMarks);
};

const calculateOverallAverage = (subjectAverages) => {
    return calculateAverage(subjectAverages);
}

module.exports = {
    calculateAssessmentAverage,
    calculateDayAverage,
    calculateSubjectAverage,
    calculateOverallAverage
}
