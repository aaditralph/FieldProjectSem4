import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

interface Stats {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  totalAmount: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getStats();
      setStats(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'total': return '#3498db';
      case 'completed': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'active': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const activeCount = (stats?.totalRequests || 0) - (stats?.completedRequests || 0) - (stats?.pendingRequests || 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the BMC E-Waste Management Dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: getStatusColor('total') }}>
          <div className="stat-icon" style={{ backgroundColor: getStatusColor('total') }}>📊</div>
          <div className="stat-content">
            <h3>{stats?.totalRequests || 0}</h3>
            <p>Total Requests</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: getStatusColor('completed') }}>
          <div className="stat-icon" style={{ backgroundColor: getStatusColor('completed') }}>✅</div>
          <div className="stat-content">
            <h3>{stats?.completedRequests || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: getStatusColor('pending') }}>
          <div className="stat-icon" style={{ backgroundColor: getStatusColor('pending') }}>⏳</div>
          <div className="stat-content">
            <h3>{stats?.pendingRequests || 0}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: getStatusColor('active') }}>
          <div className="stat-icon" style={{ backgroundColor: getStatusColor('active') }}>🔄</div>
          <div className="stat-content">
            <h3>{activeCount}</h3>
            <p>Active (In Progress)</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/tickets" className="action-card">
            <div className="action-icon">🎫</div>
            <h3>View Tickets</h3>
            <p>Manage and update pickup requests</p>
          </Link>
          
          <Link to="/date-slots" className="action-card">
            <div className="action-icon">📅</div>
            <h3>Manage Date Slots</h3>
            <p>Configure available pickup dates</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
