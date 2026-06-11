import { useState } from 'react';
import DiagnosePage from './pages/DiagnosePage.jsx';
import HeatmapPage from './pages/HeatmapPage.jsx';

export default function App() {
  const [tab, setTab] = useState('diagnose');

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-logo">Kisan<span>Bot</span></div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === 'diagnose' ? 'active' : ''}`} onClick={() => setTab('diagnose')}>
            Diagnose
          </button>
          <button className={`nav-tab ${tab === 'heatmap' ? 'active' : ''}`} onClick={() => setTab('heatmap')}>
            Community
          </button>
        </div>
      </nav>

      {tab === 'diagnose' ? <DiagnosePage /> : <HeatmapPage />}
    </div>
  );
}
