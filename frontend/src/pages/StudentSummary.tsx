import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { hodApi } from '../api/hodApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

const StudentSummary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = searchParams.get('studentId');
  const semesterId = searchParams.get('semesterId');

  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId && semesterId) {
      fetchSummary();
    }
  }, [studentId, semesterId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hodApi.getStudentSummary(studentId, semesterId);
      setSummaryData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student summary');
    } finally {
      setLoading(false);
    }
  };

  const getMarksForDateAndSubject = (date, subjectId) => {
    const dayData = summaryData.summary.find(d => d.date === date);
    if (!dayData) return '-';
    const subjectData = dayData.subjects.find(s => s.subjectId === subjectId);
    return subjectData?.marks !== undefined ? subjectData.marks : '-';
  };

  const getSubjectAverage = (subjectId) => {
    const subjectAvg = summaryData.subjectAverages?.find(s => s.subjectId === subjectId);
    return subjectAvg?.average !== undefined ? subjectAvg.average.toFixed(2) : '-';
  };

  if (!studentId || !semesterId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Missing student ID or semester ID.</p>
          <Button onClick={() => navigate('/', {
            state: {
            dashboardFilters: location.state?.dashboardFilters }
          })} className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !summaryData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="student-summary-page">
      <Button onClick={() => navigate('/', {
        state: {
          dashboardFilters: location.state?.dashboardFilters
        }
      })} variant="outline">
        ← Back to Dashboard
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {summaryData && (
        <>
          <Card className="summary-info-card">
            <CardHeader className="summary-info-heading">
              <div><p className="summary-eyebrow">STUDENT PROFILE</p><CardTitle className="summary-person-name">{summaryData.student.name}</CardTitle></div>
              <span className="summary-semester-badge">Semester {summaryData.semester}</span>
            </CardHeader>
            <CardContent className="summary-info-content">
              <div className="summary-facts-grid">
                <div className="summary-fact">
                  <p className="summary-key">Name</p>
                  <p className="summary-value summary-person-value">{summaryData.student.name}</p>
                </div>
                <div className="summary-fact">
                  <p className="summary-key">Student ID</p>
                  <p className="summary-value summary-id-value">{summaryData.student.uid}</p>
                </div>
                <div className="summary-fact">
                  <p className="summary-key">Batch</p>
                  <p className="summary-value">{summaryData.student.batch}</p>
                </div>
                <div className="summary-fact">
                  <p className="summary-key">Section</p>
                  <p className="summary-value">{summaryData.student.section}</p>
                </div>
                <div className="summary-fact">
                  <p className="summary-key">Semester</p>
                  <p className="summary-value">{summaryData.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!summaryData.summary || summaryData.summary.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No marks data available for this student.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="summary-marks-card">
              <CardHeader className="summary-marks-heading">
                <div><p className="summary-eyebrow">ASSESSMENT HISTORY</p><CardTitle>Detailed marks</CardTitle></div>
                <span className="summary-record-count">{summaryData.summary.length} {summaryData.summary.length === 1 ? 'assessment' : 'assessments'}</span>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="summary-table">
                  <TableHeader>
  <TableRow>
    <TableHead>Date</TableHead>
    <TableHead>Communication Skills</TableHead>
    <TableHead>Technical Skills</TableHead>
    <TableHead>Behavioural Skills</TableHead>
    <TableHead>Soft Skills</TableHead>
    <TableHead className="text-right">Day Average</TableHead>
  </TableRow>
</TableHeader>

<TableBody>
  {summaryData.summary.map((day, index) => {
    const subject = day.subjects[0];

    return (
      <TableRow key={`${day.date}-${index}`}>
        <TableCell className="font-medium">
          {day.date}
        </TableCell>

        <TableCell>{subject?.communicationSkills ?? '-'}</TableCell>
        <TableCell>{subject?.technicalSkills ?? '-'}</TableCell>
        <TableCell>{subject?.behaviouralSkills ?? '-'}</TableCell>
        <TableCell>{subject?.softSkills ?? '-'}</TableCell>

        <TableCell className="text-right font-medium">
          {day.dayAverage !== undefined
            ? day.dayAverage.toFixed(2)
            : '-'}
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>
                  <TableFooter>
  <TableRow>
    <TableCell className="font-medium">
      Skill Average
    </TableCell>

    {[
      'communicationSkills',
      'technicalSkills',
      'behaviouralSkills',
      'softSkills'
    ].map(skill => {
      const marks = summaryData.summary.flatMap(day =>
        day.subjects
          .map(subject => subject[skill])
          .filter(mark => typeof mark === 'number' && Number.isFinite(mark))
      );

      const average = marks.length
        ? marks.reduce((sum, mark) => sum + mark, 0) / marks.length
        : null;

      return (
        <TableCell key={skill} className="font-medium">
          {average !== null ? average.toFixed(2) : '-'}
        </TableCell>
      );
    })}

    <TableCell className="text-right font-medium">
      {summaryData.overallAverage !== undefined
        ? summaryData.overallAverage.toFixed(2)
        : '-'}
    </TableCell>
  </TableRow>
</TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default StudentSummary;
