import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { hodApi } from '../api/hodApi';
import { Navigate, useNavigate } from 'react-router-dom';

export default function HodDashboard({ user, onLogout }) {
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({ branchId: '', semesterId: '', section: '' });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
const Navigate = useNavigate();
  useEffect(() => {
    Promise.all([hodApi.getBranches(), hodApi.getSemesters(), hodApi.getSections()]).then(([b, s, c]) => {
      setBranches(b.branches || []); setSemesters(s.semesters || []); setSections(c.sections || []);
    }).catch(error => toast.error(error.response?.data?.message || 'Could not load dashboard filters.')).finally(() => setOptionsLoading(false));
  }, []);

  const update = (key, value) => { setFilters(old => ({ ...old, [key]: value })); setDashboard(null); };
  const loadDashboard = async (event) => {
    event.preventDefault();
    if (!filters.branchId || !filters.semesterId || !filters.section) { toast.warning('Choose a branch, semester and section.'); return; }
    setLoading(true);
    try { setDashboard(await hodApi.getDashboard(filters.branchId, filters.semesterId, filters.section)); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not load the HOD dashboard.'); }
    finally { setLoading(false); }
  };

  const downloadExcel = () => {
    if (!dashboard?.students?.length) { toast.warning('There are no student records to export.'); return; }
    const subjects = dashboard.subjects || [];
    const rows = dashboard.students.map(student => {
      const row = { Name: student.name, UID: student.uid, Batch: student.batch, Section: student.section };
      subjects.forEach(subject => {
        const average = student.subjectAverages?.find(item => item.subjectId === subject.id)?.average;
        row[subject.name] = average == null ? '' : Number(average.toFixed(2));
      });
      row['Overall average'] = Number((student.overallAverage || 0).toFixed(2));
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, ...subjects.map(() => ({ wch: 18 })), { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student performance');
    XLSX.writeFile(workbook, `student-performance-sem${dashboard.filters?.semester || filters.semesterId}-${filters.section || 'all'}.xlsx`);
    toast.success('Excel report downloaded.');
  };

  return <div className="dashboard-shell"><header className="app-header"><a className="header-brand" href="/hod-dashboard"><span className="brand-mini">CM</span><span>College Marks<span className="brand-sub">Academic workspace</span></span></a><div className="header-user"><div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div><div className="user-meta"><strong>{user.name}</strong><span>Academic administrator</span></div><button className="logout-button" onClick={onLogout}>Sign out</button></div></header>
    <main className="dashboard-main"><div className="page-intro"><div><p className="eyebrow">ACADEMIC OVERVIEW</p><h1>Student performance</h1></div></div>
      <section className="panel selection-panel"><div className="section-heading"><div><h2>Find a cohort</h2><p>Select a group of students to view their recorded performance.</p></div><span className="step-number">01</span></div>
        <form onSubmit={loadDashboard}><div className="filters-grid filters-three"><label className="field-label">Branch<select value={filters.branchId} disabled={optionsLoading} onChange={e => update('branchId', e.target.value)}><option value="">Select branch</option>{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field-label">Semester<select value={filters.semesterId} disabled={optionsLoading} onChange={e => update('semesterId', e.target.value)}><option value="">Select semester</option>{semesters.map(item => <option key={item.id} value={item.id}>Semester {item.number}</option>)}</select></label><label className="field-label">Section<select value={filters.section} disabled={optionsLoading} onChange={e => update('section', e.target.value)}><option value="">Select section</option>{sections.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="form-action"><button className="primary-button" type="submit" disabled={loading || optionsLoading}>{loading ? 'Loading…' : 'View performance'}<span aria-hidden="true">→</span></button></div></form>
      </section>
      {dashboard && <section className="panel marks-panel"><div className="section-heading"><div><h2>Student performance</h2><p>{dashboard.filters?.academicYear} · {dashboard.filters?.term} · Semester {dashboard.filters?.semester} · Section {dashboard.filters?.section}</p></div><div className="overview-actions"><span className="result-count">{dashboard.students?.length || 0} students</span><button type="button" className="export-button" onClick={downloadExcel}>Download Excel <span aria-hidden="true">↓</span></button></div></div>{dashboard.students?.length ? <div className="table-scroll"><table className="marks-table"><thead><tr><th>Student</th><th>UID</th>{dashboard.subjects?.map(subject => <th key={subject.id}>{subject.name}<small> average</small></th>)}<th>Overall</th></tr></thead>
      
      <tbody>
  {dashboard.students.map(student => (
    <tr
      key={student.id}
      onClick={() =>
        navigate(
          `/student-summary?studentId=${student.id}&semesterId=${filters.semesterId}`,
          {
            state: {
              dashboardFilters: filters
            }
          }
        )
      }
      className="cursor-pointer hover:bg-gray-100"
      title="Click to view student summary"
    >
      <td className="student-name">{student.name}</td>

      <td className="student-uid">{student.uid}</td>

      {dashboard.subjects?.map(subject => {
        const avg = student.subjectAverages?.find(
          item => item.subjectId === subject.id
        )?.average;

        return (
          <td key={subject.id}>
            {avg == null ? '—' : Number(avg).toFixed(2)}
          </td>
        );
      })}

      <td>
        <strong>
          {Number(student.overallAverage || 0).toFixed(2)}
        </strong>
      </td>
    </tr>
  ))}
</tbody>
      
      </table></div> : <div className="empty-inline">No students found for this cohort.</div>}</section>}
      {!dashboard && !loading && <div className="empty-state compact"><div className="empty-icon">▤</div><h2>Choose a cohort to begin</h2><p>Performance details will appear here after you select the filters.</p></div>}
      <footer className="page-footer">College Marks System <span>•</span> Academic records workspace</footer>
    </main>
  </div>;
}
