import { useState, useEffect } from 'react';

export default function HeatmapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/reports`)
      .then(r => r.json())
      .then(data => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading community reports…</p>
      </div>
    );
  }

  // Aggregate by district
  const districtCounts = {};
  const issueCounts = {};
  const cropCounts = {};

  reports.forEach(r => {
    districtCounts[r.district] = (districtCounts[r.district] || 0) + 1;
    if (r.issue) {
      const key = `${r.issue}__${r.severity || 'low'}`;
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    }
    if (r.crop) cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
  });

  const sortedDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedDistricts[0]?.[1] || 1;

  const topIssues = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const highCount = reports.filter(r => r.severity === 'high').length;

  return (
    <div className="heatmap-page">
      <h2>Community crop reports</h2>
      <p className="subtitle">Anonymous reports from farmers across Kerala — last 30 days</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{reports.length}</div>
          <div className="stat-label">Total reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#B03A2E' }}>{highCount}</div>
          <div className="stat-label">High severity</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ fontSize: 18, paddingTop: 6 }}>{topCrop}</div>
          <div className="stat-label">Most reported crop</div>
        </div>
      </div>

      {sortedDistricts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#8a7a6a', fontSize: 15 }}>
          No reports yet. Be the first to submit a diagnosis!
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#A0522D' }}>
            Reports by district
          </div>
          <div className="district-list">
            {sortedDistricts.map(([district, count]) => (
              <div className="district-row" key={district}>
                <span className="district-name">{district}</span>
                <div className="bar-wrap">
                  <div className="bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="district-count">{count} report{count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>

          {topIssues.length > 0 && (
            <div className="top-issues">
              <h3>Top reported issues</h3>
              {topIssues.map(([key, count]) => {
                const [issue, severity] = key.split('__');
                return (
                  <span className={`issue-tag ${severity}`} key={key}>
                    {issue} <strong>×{count}</strong>
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 28, padding: '18px', background: '#EAF3EB', borderRadius: 12, border: '1.5px solid rgba(74,124,78,0.2)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#4A7C4E', marginBottom: 6 }}>
          About this data
        </div>
        <p style={{ fontSize: 13, color: '#3d3d3a', lineHeight: 1.6 }}>
          All reports are fully anonymous. No personal information is stored. District-level data helps farmers and agricultural departments spot outbreak patterns early.
        </p>
      </div>
    </div>
  );
}
