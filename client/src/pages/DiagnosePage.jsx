import { useState } from 'react';
import DiagnoseForm from '../components/DiagnoseForm.jsx';
import ResultCard from '../components/ResultCard.jsx';
import SavedDiagnoses from '../components/SavedDiagnoses.jsx';

export default function DiagnosePage() {
  const [result, setResult] = useState(null);
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    setError('');
    setResult(null);
    setCrop(formData.crop);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Analysing your crop problem…</p>
      </div>
    );
  }

  if (result) {
    return <ResultCard result={result} crop={crop} onReset={() => setResult(null)} />;
  }

  return (
    <>
      <div className="hero">
        <h1>What's wrong with your <em>crop?</em></h1>
        <p>Describe the problem and get an instant AI-powered diagnosis with treatment steps.</p>

        {/* Saved diagnoses toggle */}
        <button className="saved-toggle" onClick={() => setShowSaved(s => !s)}>
          {showSaved ? '▲ Hide saved' : '💾 View saved diagnoses'}
        </button>
      </div>

      {showSaved && <SavedDiagnoses />}

      {error && (
        <div style={{
          background: '#FAEAEA', border: '1.5px solid #B03A2E',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16,
          fontSize: 14, color: '#B03A2E'
        }}>
          {error}
        </div>
      )}

      <DiagnoseForm onSubmit={handleSubmit} />
    </>
  );
}
