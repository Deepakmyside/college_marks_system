import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { hodApi } from '../api/hodApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Select, SelectOption } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';

const HodDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(
    location.state?.dashboardFilters || {
    branchId: '',
    semesterId: '',
    section: ''
  } );
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [filterLoading, setFilterLoading] = useState(true);
  const [filterError, setFilterError] = useState(null);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    setFilterLoading(true);
    setFilterError(null);
    try {
      const [branchesData, semestersData, sectionsData] = await Promise.all([
        hodApi.getBranches(),
        hodApi.getSemesters(),
        hodApi.getSections()
      ]);
      
      setBranches(branchesData.branches || []);
      setSemesters(semestersData.semesters || []);
      setSections(sectionsData.sections || []);
    } catch (err) {
      setFilterError('Failed to load filter options');
      console.error('Error loading filter data:', err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const fetchDashboard = async () => {
    if (!filters.branchId || !filters.semesterId || !filters.section) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Dashboard filters:", filters);
      const data = await hodApi.getDashboard(filters.branchId, filters.semesterId, filters.section);
      setDashboardData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (studentId) => {
    navigate(`/student-summary?studentId=${studentId}&semesterId=${filters.semesterId}`,  {
      state: {
        dashboardFilters: filters
      }
    });
  };

  const getSubjectAverage = (student, subjectId) => {
    const subjectAvg = student.subjectAverages?.find(s => s.subjectId === subjectId);
    return subjectAvg?.average !== undefined ? subjectAvg.average.toFixed(2) : '-';
  };
   
  const downloadExcel = () => {
  if (!dashboardData?.students?.length) {
    return;
  }

  const rows = dashboardData.students.map(student => {
    const row = {
      UID: student.uid,
      'Student Name': student.name,
    };

    dashboardData.subjects.forEach(subject => {
      const subjectAverage = student.subjectAverages?.find(
        item => item.subjectId === subject.id
      );

      row[subject.name] =
        subjectAverage?.average !== undefined
          ? Number(subjectAverage.average.toFixed(2))
          : '';
    });

    row['Overall Average'] =
      student.overallAverage !== undefined
        ? Number(student.overallAverage.toFixed(2))
        : '';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
  { wch: 15 }, // UID
  { wch: 25 }, // Student Name
  ...dashboardData.subjects.map(() => ({ wch: 20 })),
  { wch: 18 }, // Overall Average
];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Student Performance'
  );

  const fileName =
    `${dashboardData.filters.batch}_Sem${dashboardData.filters.semester}_Section${dashboardData.filters.section}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
  if (filterLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-[#0F172A]">HOD Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (filterError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Card className="mb-4 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{filterError}</p>
            <Button onClick={loadFilterData} variant="outline" className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-[#0F172A]">HOD Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-[#0F172A]">HOD Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              <Select
                value={filters.branchId}
                onChange={(e) => handleFilterChange('branchId', e.target.value)}
              >
                <SelectOption value="">Select Branch</SelectOption>
                {branches.map(branch => (
                  <SelectOption key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Semester</label>
              <Select
                value={filters.semesterId}
                onChange={(e) => handleFilterChange('semesterId', e.target.value)}
              >
                <SelectOption value="">Select Semester</SelectOption>
                {semesters.map(sem => (
                  <SelectOption key={sem.id} value={sem.id}>
                    Semester {sem.number}
                  </SelectOption>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <Select
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
              >
                <SelectOption value="">Select Section</SelectOption>
                {sections.map(section => (
                  <SelectOption key={section} value={section}>
                    {section}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={fetchDashboard}
              disabled={
                !filters.branchId ||
                !filters.semesterId ||
                !filters.section ||
                loading
              }
            >
              {loading ? 'Loading...' : 'Load Dashboard'}
            </Button>

            {dashboardData?.students?.length > 0 && (
              <Button
                onClick={downloadExcel}
                variant="outline"
              >
                Download Excel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {dashboardData && (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-[#0F172A]">Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Academic Year</p>
                  <p className="font-medium">{dashboardData.filters.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Term</p>
                  <p className="font-medium">{dashboardData.filters.term}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="font-medium">{dashboardData.filters.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{dashboardData.filters.section}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!dashboardData.subjects || dashboardData.subjects.length === 0 ? (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No subjects found for this selection.</p>
              </CardContent>
            </Card>
          ) : !dashboardData.students || dashboardData.students.length === 0 ? (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No students found for this selection.</p>
              </CardContent>
            </Card>
          ) : (
            <Table className="border border-[#E2E8F0]">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-[#F8FAFC] text-[#0F172A]">UID</TableHead>
                  <TableHead className="bg-[#F8FAFC] text-[#0F172A]">Student Name</TableHead>
                  {dashboardData.subjects.map(subject => (
                    <TableHead key={subject.id} className="bg-[#F8FAFC] text-[#0F172A]">{subject.name}</TableHead>
                  ))}
                  <TableHead className="bg-[#F8FAFC] text-[#0F172A] text-right">Overall Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.students.map(student => (
                  <TableRow 
                    key={student.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleStudentClick(student.id)}
                  >
                    <TableCell>{student.uid}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    {dashboardData.subjects.map(subject => (
                      <TableCell key={subject.id}>
                        {getSubjectAverage(student, subject.id)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {student.overallAverage !== undefined ? student.overallAverage.toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
};

export default HodDashboard;
