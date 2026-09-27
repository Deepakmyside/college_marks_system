import React, { useEffect, useState } from 'react';
import { teacherApi } from '../api/teacherApi';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';

import {
  Select,
  SelectOption,
} from '../components/ui/Select';

import { Button } from '../components/ui/Button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';

const TeacherDashboard = () => {
  const [filters, setFilters] = useState({
    branchId: '',
    semesterId: '',
    section: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [b, s, sec] = await Promise.all([
          teacherApi.getBranches(),
          teacherApi.getSemesters(),
          teacherApi.getSections(),
        ]);

        setBranches(b.branches || []);
        setSemesters(s.semesters || []);
        setSections(sec.sections || []);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load filter data');
      }
    };

    loadData();
  }, []);

  // Load subjects when branch + semester changes
  useEffect(() => {
    if (!filters.branchId || !filters.semesterId) {
      setSubjects([]);
      return;
    }

    const loadSubjects = async () => {
      try {
        const data = await teacherApi.getSubjects(
          filters.branchId,
          filters.semesterId
        );

        setSubjects(data.subjects || []);
      } catch (error) {
        console.error(error);
        setSubjects([]);
        setMessage('Failed to load subjects');
      }
    };

    loadSubjects();
  }, [filters.branchId, filters.semesterId]);

  const handleChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));

    setMessage('');

    if (
      field === 'branchId' ||
      field === 'semesterId' ||
      field === 'section'
    ) {
      setStudents([]);
      setMarks({});
    }

    if (
      field === 'branchId' ||
      field === 'semesterId'
    ) {
      setFilters(prev => ({
        ...prev,
        [field]: value,
        subjectId: '',
      }));
    }
  };

  const loadStudents = async () => {
    if (
      !filters.branchId ||
      !filters.semesterId ||
      !filters.section ||
      !filters.subjectId
    ) {
      setMessage('Please select all required fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const data = await teacherApi.getStudents(
        filters.branchId,
        filters.semesterId,
        filters.section
      );

      setStudents(data.students || []);

      const initialMarks = {};

      (data.students || []).forEach(student => {
        initialMarks[student.id] = '';
      });

      setMarks(initialMarks);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
        'Failed to load students'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, value) => {
    if (value === '') {
      setMarks(prev => ({
        ...prev,
        [studentId]: '',
      }));
      return;
    }

    const number = Number(value);

    if (number < 0 || number > 10) return;

    setMarks(prev => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const submitMarks = async () => {
    const incomplete = students.some(
      student =>
        marks[student.id] === '' ||
        marks[student.id] === undefined
    );

    if (incomplete) {
      setMessage('Please enter marks for all students');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const payload = {
        teacherId: 1,
        subjectId: Number(filters.subjectId),
        branchId: Number(filters.branchId),
        section: filters.section,
        date: filters.date,

        marks: students.map(student => ({
          studentId: student.id,
          marks: Number(marks[student.id]),
        })),
      };

      const data = await teacherApi.submitMarks(payload);

      setMessage(
        data.message || 'Marks submitted successfully'
      );

      setStudents([]);
      setMarks({});
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
        'Failed to submit marks'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Teacher Dashboard</CardTitle>
        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Branch
              </label>

              <Select
                value={filters.branchId}
                onChange={e =>
                  handleChange('branchId', e.target.value)
                }
              >
                <SelectOption value="">
                  Select Branch
                </SelectOption>

                {branches.map(branch => (
                  <SelectOption
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Semester
              </label>

              <Select
                value={filters.semesterId}
                onChange={e =>
                  handleChange('semesterId', e.target.value)
                }
              >
                <SelectOption value="">
                  Select Semester
                </SelectOption>

                {semesters.map(semester => (
                  <SelectOption
                    key={semester.id}
                    value={semester.id}
                  >
                    Semester {semester.number}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Section
              </label>

              <Select
                value={filters.section}
                onChange={e =>
                  handleChange('section', e.target.value)
                }
              >
                <SelectOption value="">
                  Select Section
                </SelectOption>

                {sections.map(section => (
                  <SelectOption
                    key={section}
                    value={section}
                  >
                    {section}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject
              </label>

              <Select
                value={filters.subjectId}
                onChange={e =>
                  handleChange('subjectId', e.target.value)
                }
                disabled={
                  !filters.branchId ||
                  !filters.semesterId
                }
              >
                <SelectOption value="">
                  Select Subject
                </SelectOption>

                {subjects.map(subject => (
                  <SelectOption
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Date
              </label>

              <input
                type="date"
                value={filters.date}
                onChange={e =>
                  handleChange('date', e.target.value)
                }
                className="w-full h-10 rounded-md border px-3"
              />
            </div>

          </div>

          <Button
            onClick={loadStudents}
            disabled={loading}
            className="mt-5"
          >
            {loading ? 'Loading...' : 'Load Students'}
          </Button>

        </CardContent>
      </Card>

      {message && (
        <Card>
          <CardContent className="pt-6">
            <p>{message}</p>
          </CardContent>
        </Card>
      )}

      {students.length > 0 && (
        <Card>

          <CardHeader>
            <CardTitle>Enter Marks</CardTitle>
          </CardHeader>

          <CardContent>

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>UID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {students.map(student => (
                  <TableRow key={student.id}>

                    <TableCell>
                      {student.uid}
                    </TableCell>

                    <TableCell>
                      {student.name}
                    </TableCell>

                    <TableCell>

                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={marks[student.id] ?? ''}
                        onChange={e =>
                          handleMarkChange(
                            student.id,
                            e.target.value
                          )
                        }
                        className="w-24 h-9 border rounded-md px-2"
                      />

                    </TableCell>

                  </TableRow>
                ))}

              </TableBody>

            </Table>

            <Button
              onClick={submitMarks}
              disabled={loading}
              className="mt-5"
            >
              {loading ? 'Submitting...' : 'Submit Marks'}
            </Button>

          </CardContent>

        </Card>
      )}

    </div>
  );
};

export default TeacherDashboard;