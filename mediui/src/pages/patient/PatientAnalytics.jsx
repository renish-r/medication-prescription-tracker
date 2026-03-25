import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Pill, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import './PatientAnalytics.css';

const PatientAnalytics = () => {
  const [adherenceData, setAdherenceData] = useState([]);
  const [dailyStatsData, setDailyStatsData] = useState([]);
  const [overallAdherence, setOverallAdherence] = useState(0);
  const [totalPrescriptions, setTotalPrescriptions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  // Auto-refresh when a dose is logged elsewhere in the app
  useEffect(() => {
    const handler = () => {
      fetchAnalyticsData();
    };
    window.addEventListener('doseLogged', handler);
    return () => window.removeEventListener('doseLogged', handler);
  }, []);

  // Also refresh when localStorage changes (cross-tab) or when tab becomes visible
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'doseLoggedStamp') {
        fetchAnalyticsData();
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAnalyticsData();
      }
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const getDaysBack = () => {
    switch (dateRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 30;
    }
  };

  const pad2 = (n) => String(n).padStart(2, '0');
  const dateKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const daysBack = getDaysBack();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Backend expects ISO_LOCAL_DATE_TIME (no timezone), so format without the trailing 'Z'
      const toLocalIsoNoZ = (date) =>
        `${dateKey(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;

      const startStr = toLocalIsoNoZ(startDate);
      const endStr = toLocalIsoNoZ(endDate);

      // Fetch adherence data
      const adherenceRes = await apiClient.get('/patient/adherence', {
        params: { startDate: startStr, endDate: endStr }
      });

      // Fetch dose logs
      const doseLogsRes = await apiClient.get('/patient/dose-logs', {
        params: { startDate: startStr, endDate: endStr }
      });

      // Fetch prescriptions
      const prescriptionsRes = await apiClient.get('/patient/prescriptions');

      // Handle response structure - data might be in response itself or response.data
      const adherenceData = adherenceRes.data || adherenceRes;
      const doseLogs = Array.isArray(doseLogsRes) ? doseLogsRes : (doseLogsRes.data || []);
      const prescriptions = Array.isArray(prescriptionsRes) ? prescriptionsRes : (prescriptionsRes.data || []);

      console.log('Adherence response:', adherenceData);
      console.log('Raw dose logs:', doseLogs);
      console.log('Prescriptions:', prescriptions);

      setOverallAdherence(adherenceData?.adherencePercentage || 0);
      setTotalPrescriptions(prescriptions?.length || 0);

      // Process dose logs into daily data
      const dailyStats = processDoseLogsData(doseLogs, daysBack);
      console.log('Processed daily stats:', dailyStats);
      setDailyStatsData(dailyStats);

      // Generate adherence trend
      const adherenceTrend = generateAdherenceTrend(doseLogs, daysBack);
      setAdherenceData(adherenceTrend);

      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processDoseLogsData = (logs, daysBack) => {
    const stats = {};
    
    for (let i = 0; i <= daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = dateKey(date);
      stats[dateStr] = { date: dateStr, taken: 0, missed: 0 };
    }

    console.log('Processing', logs.length, 'dose logs');
    logs.forEach(log => {
      const rawDate = log.takenAt || log.createdAt;
      if (!rawDate) {
        console.log('No date for log:', log);
        return;
      }
      const dateStr = dateKey(new Date(rawDate));
      console.log('Log date:', rawDate, '→', dateStr, 'status:', log.status);
      if (stats[dateStr]) {
        const status = (log.status || '').toUpperCase();
        if (status === 'TAKEN') {
          stats[dateStr].taken += 1;
        } else {
          stats[dateStr].missed += 1;
        }
      } else {
        console.log('Date not in range:', dateStr);
      }
    });

    return Object.values(stats)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        taken: item.taken,
        missed: item.missed
      }));
  };

  const generateAdherenceTrend = (logs, daysBack) => {
    const trend = [];
    
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = dateKey(date);
      
      const daySLogs = logs.filter(log => {
        const rawDate = log.takenAt || log.createdAt;
        if (!rawDate) return false;
        return dateKey(new Date(rawDate)) === dateStr;
      });

      if (daySLogs.length > 0) {
        const taken = daySLogs.filter(l => (l.status || '').toUpperCase() === 'TAKEN').length;
        const total = daySLogs.length;
        const percentage = Math.round((taken / total) * 100);
        
        trend.push({
          date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          adherence: percentage
        });
      }
    }

    return trend;
  };

  const getAdherenceColor = (value) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getAdherenceStatus = (value) => {
    if (value >= 80) return { status: 'Excellent', color: '#10b981' };
    if (value >= 60) return { status: 'Good', color: '#f59e0b' };
    return { status: 'Needs Improvement', color: '#ef4444' };
  };

  const status = getAdherenceStatus(overallAdherence);

  if (loading) {
    return (
      <div className="patient-analytics loading">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="patient-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>
            <TrendingUp size={28} />
            Your Medication Analytics
          </h1>
          <p>Track your medication consistency and improve your health outcomes</p>
        </div>
        
        <div className="date-range-selector">
          <button 
            className={`range-btn ${dateRange === '7days' ? 'active' : ''}`}
            onClick={() => setDateRange('7days')}
          >
            7 Days
          </button>
          <button 
            className={`range-btn ${dateRange === '30days' ? 'active' : ''}`}
            onClick={() => setDateRange('30days')}
          >
            30 Days
          </button>
          <button 
            className={`range-btn ${dateRange === '90days' ? 'active' : ''}`}
            onClick={() => setDateRange('90days')}
          >
            90 Days
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: status.color }}>
            <Pill size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Overall Adherence</div>
            <div className="kpi-value" style={{ color: status.color }}>
              {overallAdherence.toFixed(1)}%
            </div>
            <div className="kpi-status" style={{ color: status.color }}>
              {status.status}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: '#2196f3' }}>
            <Calendar size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Active Prescriptions</div>
            <div className="kpi-value" style={{ color: '#2196f3' }}>
              {totalPrescriptions}
            </div>
            <div className="kpi-status" style={{ color: '#2196f3' }}>
              Tracked
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        {/* Daily Medication Chart */}
        <div className="chart-card">
          <h2>Daily Medication Intake</h2>
          <p className="chart-subtitle">Medicines taken vs missed per day</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d5f3e" />
              <XAxis 
                dataKey="date" 
                stroke="#a5d6a7"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#a5d6a7" />
              <Tooltip 
                contentStyle={{ 
                  background: '#0f241c',
                  border: '1px solid #2d5f3e',
                  borderRadius: '8px',
                  color: '#e8f5e9'
                }}
              />
              <Legend />
              <Bar dataKey="taken" fill="#10b981" name="Taken" />
              <Bar dataKey="missed" fill="#ef4444" name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Adherence Trend Chart */}
        <div className="chart-card">
          <h2>Adherence Trend</h2>
          <p className="chart-subtitle">Your daily adherence percentage</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adherenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d5f3e" />
              <XAxis 
                dataKey="date" 
                stroke="#a5d6a7"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#a5d6a7"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#0f241c',
                  border: '1px solid #2d5f3e',
                  borderRadius: '8px',
                  color: '#e8f5e9'
                }}
                formatter={(value) => `${value}%`}
              />
              <Line 
                type="monotone" 
                dataKey="adherence" 
                stroke="#4caf50" 
                strokeWidth={3}
                dot={{ fill: '#4caf50', r: 5 }}
                activeDot={{ r: 7 }}
                name="Adherence %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h2>📊 Your Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">💊</div>
            <div className="insight-content">
              <h3>Consistency</h3>
              <p>
                {overallAdherence >= 80 
                  ? "Great job! You're maintaining excellent medication consistency." 
                  : overallAdherence >= 60
                  ? "You're doing well, but try to be more consistent with your medications."
                  : "Remember to take your medications regularly to improve your health."}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h3>Recommendations</h3>
              <ul>
                <li>Set daily reminders for medication times</li>
                <li>Take medications with meals if recommended</li>
                <li>Keep a medication log for reference</li>
                <li>Contact your doctor if you miss doses regularly</li>
              </ul>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">⏰</div>
            <div className="insight-content">
              <h3>Best Times</h3>
              <p>Most of your medications are taken between 8-9 AM and 8-9 PM. Try to maintain this routine for better adherence.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAnalytics;
