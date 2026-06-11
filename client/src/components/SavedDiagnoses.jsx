import { useState, useEffect } from 'react';

const SEV_COLORS = {
  low:    { bg: '#EAF3EB', color: '#4A7C4E' },
  medium: { bg: '#FDF3E3', color: '#C07B2A' },
  high:   { bg: '#FAEAEA', color: '#B03A2E' },
};

export default function SavedDiagnoses() {
  const [saved, setSaved] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('kisanbot_saved') || '[]');
    setSaved(data);
  }, []);

  function deleteEntry(id) {
    const updated = saved.filter(s => s.id !== id);
    setSaved(updated);
    localStorage.setItem('kisanbot_saved', JSON.stringify(updated));
  }

  if (saved.length === 0) {
    return (
      <div style={{
        background: 'var(--white)', border: '1.5px solid rgba(44,26,14,0.1)',
        borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center',
        fontSize: 14, color: 'var(--bark)'
      }}>
        No saved diagnoses yet. After a diagnosis, tap "💾 Save offline" to store it here.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {saved.map(entry => {
        const sev = SEV_COLORS[entry.severity] || SEV_COLORS.low;
        const isOpen = expanded === entry.id;

        return (
          <div key={entry.id} style={{
            background: 'var(--white)', border: '1.5px solid rgba(44,26,14,0.1)',
            borderRadius: 12, marginBottom: 10, overflow: 'hidden'
          }}>
            {/* Header row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', cursor: 'pointer'
            }} onClick={() => setExpanded(isOpen ? null : entry.id)}>
              <span style={{
                background: sev.bg, color: sev.color,
                borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700
              }}>
                {entry.severity?.toUpperCase()}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.issue}</div>
                <div style={{ fontSize: 12, color: 'var(--bark)' }}>
                  {entry.crop} · {entry.date}
                </div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--bark)' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(44,26,14,0.08)' }}>
                <p style={{ fontSize: 14, color: 'var(--bark)', margin: '12px 0 10px' }}>
                  {entry.cause}
                </p>

                {entry.treatment?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--clay)', marginBottom: 6 }}>Treatment</div>
                    {entry.treatment.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 13 }}>
                        <span style={{
                          minWidth: 22, height: 22, borderRadius: '50%',
                          background: 'var(--leaf)', color: 'white',
                          fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {entry.local_remedy && (
                  <div style={{ background: 'var(--mist)', borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: 10 }}>
                    <strong>Local remedy:</strong> {entry.local_remedy}
                  </div>
                )}

                <button onClick={() => deleteEntry(entry.id)} style={{
                  background: 'transparent', border: '1.5px solid rgba(176,58,46,0.3)',
                  borderRadius: 6, padding: '6px 14px', fontSize: 12,
                  color: '#B03A2E', cursor: 'pointer', marginTop: 4
                }}>
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
