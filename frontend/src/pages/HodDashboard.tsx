import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { hodApi } from '../api/hodApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';

const HodDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(location.state?.dashboardFilters || { branchId: '', semesterId: '', section: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await hodApi.getDashboardData(filters);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [filters]);

  if (loading) return <Skeleton count={5} />;

  if (!dashboardData) {
    return <p>No data available. Please check your filters or try again later.</p>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-[#0F172A]">HOD Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Performance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.performance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={() => navigate('/report')}>View Reports</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HodDashboard;
