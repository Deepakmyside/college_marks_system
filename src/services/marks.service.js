const calculateAverage = (marks) => {
    if(marks.length === 0) {
        return 0;
    }

    const total = marks.reduce((sum, mark) => sum + mark, 0);

    return total/ marks.length;
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
    calculateDayAverage,
    calculateSubjectAverage,
    calculateOverallAverage
}