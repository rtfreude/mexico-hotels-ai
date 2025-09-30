import React, { useEffect, useState, useCallback } from 'react';

export default function SanityAdmin({ apiUrl = '/api' }) {
  const [status, setStatus] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/sanity/status`);
      if (res.ok) setStatus(await res.json());
    } catch (e) {
      console.warn('Failed to fetch status', e);
    }
  }, [apiUrl]);

  async function fetchJobs() {
    const secret = window.prompt('Admin secret (x-reindex-secret)');
    if (!secret) return;
    const res = await fetch(`${apiUrl}/sanity/jobs`, { headers: { 'x-reindex-secret': secret } });
    if (res.ok) setJobs(await res.json()); else alert('Unauthorized or error');
  }

  async function triggerReindex() {
    setLoading(true);
    const secret = window.prompt('Admin secret (x-reindex-secret)');
    if (!secret) return setLoading(false);
    const res = await fetch(`${apiUrl}/sanity/reindex`, { method: 'POST', headers: { 'x-reindex-secret': secret } });
    const j = await res.json();
    alert(JSON.stringify(j));
    setLoading(false);
    fetchStatus();
  }

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  return (
    <div style={{padding:20}}>
      <h3>Sanity Admin</h3>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button onClick={fetchStatus}>Refresh Status</button>
        <button onClick={() => { fetchJobs(); }}>List Jobs</button>
        <button onClick={triggerReindex} disabled={loading}>{loading ? 'Reindexing...' : 'Trigger Reindex'}</button>
      </div>

      <div>
        <strong>Status</strong>
        <pre style={{background:'#f7f7f7', padding:8}}>{JSON.stringify(status, null, 2)}</pre>
      </div>

      <h4>Jobs</h4>
      <div style={{maxHeight:400, overflow:'auto', background:'#fff', border:'1px solid #eee', padding:8}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>id</th>
              <th>Status</th>
              <th>Type</th>
              <th>Count</th>
              <th>Duration</th>
              <th>Error</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} style={{borderTop:'1px solid #f0f0f0'}}>
                <td style={{fontFamily:'monospace', fontSize:12}}>{j.id}</td>
                <td>{j.status || '-'}</td>
                <td>{j.type || '-'}</td>
                <td>{j.count ?? '-'}</td>
                <td>{j.durationMs != null ? `${j.durationMs}ms` : '-'}</td>
                <td style={{color:'crimson', fontSize:12}}>{j.error || '-'}</td>
                <td style={{fontSize:12}}>{j.endedAt || j.startedAt || j.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
