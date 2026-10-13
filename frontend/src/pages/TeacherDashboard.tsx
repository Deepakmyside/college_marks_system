import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { teacherApi } from '../api/teacherApi';

const SKILLS = [
  { key: 'communicationSkills', label: 'Communication' },
  { key: 'technicalSkills', label: 'Technical' },
  { key: 'behaviouralSkills', label: 'Behavioural' },
  { key: 'softSkills', label: 'Soft skills' },
];

export default function TeacherDashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const selectedGroup = groups.find(item => String(item.group.id) === groupId);

  const initializeMarks = (students) => Object.fromEntries(students.map(student => [student.id, Object.fromEntries(SKILLS.map(skill => [skill.key, '']))]));

  useEffect(() => {
    let active = true;
    teacherApi.getAssignedGroups(user.id).then(response => {
      if (!active) return;
      const assigned = response.data || [];
      setGroups(assigned);
      if (assigned.length) setGroupId(String(assigned[0].group.id));
      else toast.info('No subject groups are assigned to your account yet.');
    }).catch(error => toast.error(error.response?.data?.message || 'Could not load your assigned groups.')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user.id]);

  const searchSession = async () => {
    if (!selectedGroup || !date) { toast.warning('Select a subject group and assessment date.'); return; }
    setSearching(true);
    setHasSearched(false);
    setAlreadySubmitted(false);
    const initialMarks = initializeMarks(selectedGroup.students);
    try {
      const response = await teacherApi.getExistingMarks({ subjectId: selectedGroup.subject.id, subjectGroupId: selectedGroup.group.id, date });
      (response.markSession?.assessments || []).forEach(assessment => {
        if (initialMarks[assessment.studentId]) for (const skill of SKILLS) initialMarks[assessment.studentId][skill.key] = assessment[skill.key] == null ? '' : String(assessment[skill.key]);
      });
      setMarks(initialMarks);
      setAlreadySubmitted(true);
      toast.success('Existing marks loaded for this session.');
    } catch (error) {
      if (error.response?.status === 404) setMarks(initialMarks);
      else {
        toast.error(error.response?.data?.message || 'Could not load this session.');
        setSearching(false);
        return;
      }
    }
    setHasSearched(true);
    setSearching(false);
  };

  const completion = useMemo(() => {
    const all = Object.values(marks).flatMap(student => Object.values(student));
    return { done: all.filter(value => value !== '').length, total: all.length };
  }, [marks]);

  const updateMark = (studentId, skill, value) => {
    if (value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 10)) return;
    setMarks(current => ({ ...current, [studentId]: { ...current[studentId], [skill]: value } }));
  };

  const submit = async () => {
    if (!selectedGroup) return;
    const students = selectedGroup.students;
    const incomplete = students.some(student => SKILLS.some(skill => marks[student.id]?.[skill.key] === ''));
    if (incomplete) { toast.warning('Enter all four skill marks for every student.'); return; }
    setSubmitting(true);
    try {
      const response = await teacherApi.submitMarks({
        teacherId: Number(user.id), subjectId: selectedGroup.subject.id, subjectGroupId: selectedGroup.group.id, date,
        marks: students.map(student => ({ studentId: student.id, ...Object.fromEntries(SKILLS.map(skill => [skill.key, Number(marks[student.id][skill.key])])) })),
      });
      if (response.alreadyExists) { setAlreadySubmitted(true); toast.warning(response.message || 'Marks were already submitted for this date.'); }
      else { setAlreadySubmitted(true); toast.success(response.message || 'Marks submitted successfully.'); }
    } catch (error) {
      toast.error(axios.isAxiosError(error) ? (error.response?.data?.message || 'Could not submit marks.') : 'Could not submit marks.');
    } finally { setSubmitting(false); }
  };

  return <div className="dashboard-shell">
    <header className="app-header"><a className="header-brand" href="/teacher-dashboard"><span className="brand-mini">CM</span><span>College Marks<span className="brand-sub">Academic workspace</span></span></a><div className="header-user"><div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div><div className="user-meta"><strong>{user.name}</strong><span>Teacher</span></div><button className="logout-button" onClick={onLogout}>Sign out</button></div></header>
    <main className="dashboard-main">
      <div className="page-intro"><div><p className="eyebrow">TEACHER WORKSPACE</p><h1>Record student marks</h1></div></div>
      <section className="panel selection-panel"><div className="section-heading"><div><h2>Choose a group and session</h2><p>Your subject and student groups are managed by your academic administrator.</p></div><span className="step-number">01</span></div>
        <div className="filters-grid"><label className="field-label">Assigned subject group<select value={groupId} onChange={e => { setGroupId(e.target.value); setHasSearched(false); setAlreadySubmitted(false); }} disabled={loading || !groups.length}><option value="">{loading ? 'Loading assigned groups…' : 'Select a group'}</option>{groups.map(item => <option key={item.group.id} value={item.group.id}>{item.subject.name} · {item.group.name} · Section {item.group.section}</option>)}</select></label><label className="field-label">Assessment date<input type="date" value={date} onChange={e => { setDate(e.target.value); setHasSearched(false); setAlreadySubmitted(false); }} /></label></div>
        {selectedGroup && <div className="group-meta"><span><b>Subject</b>{selectedGroup.subject.name}</span><span><b>Academic period</b>{selectedGroup.academicPeriod.academicYear} · {selectedGroup.academicPeriod.term}</span><span><b>Batch / Section</b>{selectedGroup.group.batch} · {selectedGroup.group.section}</span><span><b>Students</b>{selectedGroup.students.length}</span></div>}
        <div className="form-action"><button className="primary-button" type="button" onClick={searchSession} disabled={loading || searching || !selectedGroup}>{searching ? 'Searching…' : 'Search'}<span aria-hidden="true">⌕</span></button></div>
      </section>
      {selectedGroup && hasSearched && <section className="panel marks-panel"><div className="section-heading"><div><div className="title-row"><h2>Student marks</h2>{alreadySubmitted && <span className="submitted-tag">Already submitted</span>}</div></div><span className="step-number">02</span></div>
        <div className="table-scroll"><table className="marks-table"><thead><tr><th>Student</th><th>UID</th>{SKILLS.map(skill => <th key={skill.key}>{skill.label}<small> / 10</small></th>)}</tr></thead><tbody>{selectedGroup.students.map(student => <tr key={student.id}><td className="student-name">{student.name}</td><td className="student-uid">{student.uid}</td>{SKILLS.map(skill => <td key={skill.key}><input aria-label={`${skill.label} marks for ${student.name}`} type="number" min="0" max="10" step="0.5" value={marks[student.id]?.[skill.key] ?? ''} disabled={alreadySubmitted || submitting} onChange={e => updateMark(student.id, skill.key, e.target.value)} placeholder="—" /></td>)}</tr>)}</tbody></table></div>
        <div className="submit-row"><div className="progress-copy"><strong>{completion.done} of {completion.total}</strong> marks entered</div><button className="primary-button" onClick={submit} disabled={submitting || alreadySubmitted || !selectedGroup.students.length}>{submitting ? 'Submitting…' : alreadySubmitted ? 'Submitted for this date' : 'Submit marks'}<span aria-hidden="true">→</span></button></div>
      </section>}
      {!loading && !groups.length && <section className="empty-state"><div className="empty-icon">↗</div><h2>No groups assigned</h2><p>When an administrator assigns a subject group to you, it will appear here.</p></section>}
      <footer className="page-footer">College Marks System <span>•</span> Academic records workspace</footer>
    </main>
  </div>;
}
