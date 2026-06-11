const SEV_LABELS = { low: '🟢 Low severity', medium: '🟡 Medium severity', high: '🔴 High severity' };

const NEARBY_STORES = [
  { name: 'Krishi Bhavan', type: 'Government agriculture office', icon: '🏛️', query: 'Krishi+Bhavan' },
  { name: 'Agri supply store', type: 'Seeds, pesticides, fertilisers', icon: '🌱', query: 'agricultural+supply+store' },
  { name: 'Krishi Vigyan Kendra', type: 'Expert advisory centre', icon: '🔬', query: 'Krishi+Vigyan+Kendra' },
];

// Save diagnosis to localStorage
function saveDiagnosis(result, cropName) {
  const saved = JSON.parse(localStorage.getItem('kisanbot_saved') || '[]');
  const entry = {
    id: Date.now(),
    crop: cropName,
    date: new Date().toLocaleDateString('en-IN'),
    ...result,
  };
  saved.unshift(entry); // newest first
  // Keep only last 10
  localStorage.setItem('kisanbot_saved', JSON.stringify(saved.slice(0, 10)));
  return true;
}

function mapsLink(query) {
  return `https://www.google.com/maps/search/${query}+near+me`;
}

function buildWhatsAppText(result, crop) {
  return `🌾 *KisanBot Crop Diagnosis*\n\n*Crop:* ${crop}\n*Issue:* ${result.issue}\n*Severity:* ${result.severity}\n\n*Cause:* ${result.cause}\n\n*Treatment:*\n${result.treatment?.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n*Local Remedy:* ${result.local_remedy}\n\n*Prevention:* ${result.prevention}\n\n_Diagnosed by KisanBot_`;
}

export default function ResultCard({ result, crop, onReset }) {
  const {
    issue, cause, severity = 'low',
    treatment = [], local_remedy, prevention,
    see_expert_if, translated_summary,
  } = result;

  function handleSave() {
    saveDiagnosis(result, crop);
    alert('✅ Diagnosis saved! View it anytime under Saved Diagnoses.');
  }

  return (
    <div className="result">

      {/* Severity banner */}
      <div className={`severity-banner ${severity}`}>
        <div className="severity-label">{SEV_LABELS[severity] || severity}</div>
        <h2>{issue || 'Unknown issue'}</h2>
        {cause && <p>{cause}</p>}
      </div>

      {/* Treatment steps */}
      {treatment.length > 0 && (
        <div className="result-section">
          <h3>Treatment steps</h3>
          <ul className="treatment-steps">
            {treatment.map((step, i) => (
              <li key={i}>
                <span className="step-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Local remedy + prevention */}
      <div className="result-grid" style={{ marginBottom: 14 }}>
        {local_remedy && (
          <div className="info-chip">
            <div className="chip-label">Local remedy</div>
            <p>{local_remedy}</p>
          </div>
        )}
        {prevention && (
          <div className="info-chip">
            <div className="chip-label">Prevention</div>
            <p>{prevention}</p>
          </div>
        )}
      </div>

      {/* See expert if */}
      {see_expert_if && (
        <div style={{
          background: '#FDF3E3', border: '1.5px solid rgba(192,123,42,0.25)',
          borderRadius: 10, padding: '14px 16px', marginBottom: 14,
          fontSize: 14, color: '#6b4a1a',
        }}>
          <span style={{ fontWeight: 700 }}>See an expert if: </span>
          {see_expert_if}
        </div>
      )}

      {/* Translated summary */}
      {translated_summary && (
        <div className="translated-box" style={{ marginBottom: 14 }}>
          <div className="tl-label">Summary in your language</div>
          <p>{translated_summary}</p>
        </div>
      )}

      {/* Save + WhatsApp action buttons */}
      <div className="action-row">
        <button className="action-btn save-btn" onClick={handleSave}>
          💾 Save offline
        </button>
        <a
          className="action-btn whatsapp-btn"
          href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(result, crop))}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📤 Share on WhatsApp
        </a>
      </div>

      {/* Nearby help */}
      <div className="result-section stores-section">
        <h3>Find help nearby</h3>
        {NEARBY_STORES.map(store => (
          <a key={store.name} className="store-card"
            href={mapsLink(store.query)} target="_blank" rel="noopener noreferrer">
            <div className="store-icon">{store.icon}</div>
            <div className="store-info">
              <div className="store-name">{store.name}</div>
              <div className="store-type">{store.type}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#4A7C4E', fontSize: 18 }}>↗</span>
          </a>
        ))}
      </div>

      <button className="btn-reset" onClick={onReset}>← Diagnose another crop</button>
    </div>
  );
}
