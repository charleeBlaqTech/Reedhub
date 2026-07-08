// src/components/Admin.jsx - Administrative Diagnostic Audit Dashboard Panel
import React, { useState, useEffect } from 'react';

export default function Admin({ token, currentUser, navigateTo }) {
  const [logs, setLogs] = useState([]);
  const [announcement, setAnnouncement] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const fetchSystemAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        setLogs(data);
      } else {
        setError(data.error || 'System diagnostics authorization lookup verification failure.');
      }
    } catch (err) {
      setError('Cannot fetch system diagnostic streams from host server gateway.');
    }
  };

  useEffect(() => {
    fetchSystemAuditLogs();
  }, [token]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: announcement })
      });

      if (response.ok) {
        setStatus('Broadcast event payload written safely into log infrastructure stream.');
        setAnnouncement('');
        fetchSystemAuditLogs(); // Reload stream entries
      }
    } catch (err) {
      setError('Failed to forward diagnostic log payload.');
    }
  };

  return (
    <div id="admin-panel-container" className="max-w-4xl mx-auto space-y-6" data-testid="admin-terminal-dashboard">
      <div id="admin-banner-card" className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl p-6 shadow-sm">
        <h2 id="admin-panel-title" className="text-xl font-black tracking-tight" data-testid="admin-panel-heading">SYSTEM AUDIT CONTROL PORTAL TERMINAL</h2>
        <p className="text-xs text-amber-100 mt-1 font-medium">Diagnostic Operations Platform Tracker Node Sandbox Environment</p>
      </div>

      {error && (
        <div id="admin-err-alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium" data-testid="admin-panel-error-alert">
          🚫 Authorization Loophole Discovered: {error}
        </div>
      )}
      {status && (
        <div id="admin-success-alert" className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg font-medium" data-testid="admin-panel-success-alert">
          {status}
        </div>
      )}

      {/* BROADCAST DIAGNOSTIC LOG INJECTOR TOOLBOX */}
      <div id="admin-toolbox-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Trigger Diagnostic System Log Event Entry</h3>
        <form id="admin-announcement-form" onSubmit={handlePostAnnouncement} className="flex gap-2">
          <input
            id="input-admin-announcement"
            type="text"
            placeholder="Write arbitrary string event text payload trace..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-gray-400"
            data-testid="input-admin-log-payload"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
          <button
            id="btn-admin-broadcast-submit"
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition"
            data-testid="btn-admin-log-submit"
          >
            Inject Trace Log Event
          </button>
        </form>
      </div>

      {/* SECURITY AUDIT TRACE RECORDS LIST CONTAINER */}
      <div id="admin-audit-log-card" className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 id="admin-table-title" className="text-xs font-bold uppercase text-gray-400 tracking-wider" data-testid="text-audit-table-header">
          Physical System Trace Audit Logs Array Stream
        </h3>
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table id="admin-audit-logs-table" className="w-full text-left border-collapse" data-testid="table-system-audit-logs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3">Log Pointer ID</th>
                <th className="p-3">User Target ID</th>
                <th className="p-3">Trigger Action Flag</th>
                <th className="p-3">Detailed Payload Context</th>
                <th className="p-3">System ISO Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-mono text-gray-600">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400 italic">No trace records compiled in memory infrastructure cache pools.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50" data-testid={`tr-audit-log-row-${log.id}`}>
                    <td className="p-3 font-semibold text-gray-800">{log.id}</td>
                    <td className="p-3 text-gray-500">{log.userId}</td>
                    <td className="p-3"><span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{log.action}</span></td>
                    <td className="p-3 truncate max-w-xs font-sans text-gray-700">{log.details}</td>
                    <td className="p-3 text-[11px] text-gray-400">{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}