// pages/admin/reports.js
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';

const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

const ReportsPage = () => {
  const [scheduledReports, setScheduledReports] = useState([]);
  const [email, setEmail] = useState('');
  const [reportType, setReportType] = useState('total');
  const [scheduleInterval, setScheduleInterval] = useState('daily');
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [day, setDay] = useState(1);

  useEffect(() => {
    fetchScheduledReports();
  }, []);

  const fetchScheduledReports = async () => {
    try {
      const response = await axios.get(`https://${envApiUrl}/api/reports/schedule`);
      setScheduledReports(response.data);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
    }
  };

  const handleDownload = (type) => {
    window.location.href = `https://${envApiUrl}/api/reports/sales?type=${type}`;
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    const scheduleData = { interval: scheduleInterval, hour: parseInt(hour), minute: parseInt(minute) };
    if (scheduleInterval === 'weekly') {
      scheduleData.day_of_week = dayOfWeek;
    } else if (scheduleInterval === 'monthly') {
      scheduleData.day = parseInt(day);
    }
    try {
      await axios.post(`https://${envApiUrl}/api/reports/schedule`, {
        email,
        report_type: reportType,
        schedule: scheduleData
      });
      alert('Report scheduled successfully');
      fetchScheduledReports();
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  return (
    <Layout>
      <h1>Sales Reports</h1>
      <div>
        <h2>Download Reports</h2>
        <button onClick={() => handleDownload('total')} style={{ marginRight: '10px' }}>
          Download Total Sales Report
        </button>
        <button onClick={() => handleDownload('per_product')}>
          Download Per-Product Sales Report
        </button>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Schedule Reports</h2>
        <form onSubmit={handleSchedule}>
          <div style={{ marginBottom: '10px' }}>
            <label>Email:
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Report Type:
              <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ marginLeft: '10px' }}>
                <option value="total">Total Sales</option>
                <option value="per_product">Per-Product Sales</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Interval:
              <select value={scheduleInterval} onChange={e => setScheduleInterval(e.target.value)} style={{ marginLeft: '10px' }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
          {scheduleInterval === 'weekly' && (
            <div style={{ marginBottom: '10px' }}>
              <label>Day of Week (0=Monday):
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(e.target.value)}
                  required
                  style={{ marginLeft: '10px' }}
                />
              </label>
            </div>
          )}
          {scheduleInterval === 'monthly' && (
            <div style={{ marginBottom: '10px' }}>
              <label>Day of Month:
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  required
                  style={{ marginLeft: '10px' }}
                />
              </label>
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <label>Time (HH:MM):
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={e => setHour(e.target.value)}
                required
                style={{ marginLeft: '10px', width: '50px' }}
              />
              :
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={e => setMinute(e.target.value)}
                required
                style={{ width: '50px' }}
              />
            </label>
          </div>
          <button type="submit">Schedule Report</button>
        </form>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Scheduled Reports</h2>
        {scheduledReports.length === 0 ? (
          <p>No scheduled reports.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Report Type</th>
                <th>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {scheduledReports.map((report, index) => (
                <tr key={index}>
                  <td>{report.email}</td>
                  <td>{report.report_type}</td>
                  <td>{JSON.stringify(report.schedule)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default ReportsPage;
