import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hodApi } from '../api/hodApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';

const StudentSummary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
          <Button onClick={() => navigate('/')} className="mt-4">
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
    <div className="space-y-6">
      <Button onClick={() => navigate('/')} variant="outline">
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
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{summaryData.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UID</p>
                  <p className="font-medium">{summaryData.student.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-medium">{summaryData.student.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{summaryData.student.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Semester ID</p>
                  <p className="font-medium">{summaryData.semesterId}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Detailed Marks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {summaryData.summary[0]?.subjects.map(subject => (
                          <TableHead key={subject.subjectId}>{subject.subjectName}</TableHead>
                        ))}
                        <TableHead className="text-right">Day Average</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.summary.map((day, index) => (
                        <TableRow key={`${day.date}-${index}`}>
                          <TableCell className="font-medium">{day.date}</TableCell>
                          {day.subjects.map(subject => (
                            <TableCell key={subject.subjectId}>
                              {subject.marks !== undefined ? subject.marks : '-'}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-medium">
                            {day.dayAverage !== undefined ? day.dayAverage.toFixed(2) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-medium">Subject Average</TableCell>
                        {summaryData.subjectAverages.map(subject => (
                          <TableCell key={subject.subjectId} className="font-medium">
                            {subject.average !== undefined ? subject.average.toFixed(2) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-medium">
                          {summaryData.overallAverage !== undefined ? summaryData.overallAverage.toFixed(2) : '-'}
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
