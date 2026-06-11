import { useState, useRef } from 'react';

const KERALA_CROPS = [
  'Rice', 'Coconut', 'Banana', 'Rubber', 'Pepper',
  'Cardamom', 'Coffee', 'Tea', 'Tomato', 'Tapioca',
  'Ginger', 'Turmeric', 'Jackfruit', 'Arecanut', 'Other',
];

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

const SEASONS = ['Kharif (June–Nov)', 'Rabi (Nov–Mar)', 'Summer (Mar–Jun)'];
const LANGUAGES = ['English', 'Malayalam', 'Hindi', 'Tamil'];

// Map language name to browser speech recognition lang code
const LANG_CODES = {
  'English': 'en-IN',
  'Malayalam': 'ml-IN',
  'Hindi': 'hi-IN',
  'Tamil': 'ta-IN',
};

export default function DiagnoseForm({ onSubmit }) {
  const [form, setForm] = useState({
    crop: '', district: '', season: '', description: '', language: 'English',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const fileInputRef = useRef();
  const recognitionRef = useRef(null);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  // ── Photo upload ──────────────────────────────────────────
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Voice input ───────────────────────────────────────────
  function toggleVoice() {
    setVoiceError('');

    // Browser support check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input not supported in this browser. Try Chrome.');
      return;
    }

    // If already listening, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[form.language] || 'en-IN';
    recognition.continuous = false;       // stop after first pause
    recognition.interimResults = false;   // only final result

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      // Append to existing description (don't overwrite)
      set('description', form.description ? form.description + ' ' + transcript : transcript);
    };

    recognition.onerror = (e) => {
      setVoiceError(
        e.error === 'not-allowed'
          ? 'Microphone permission denied. Allow it in your browser settings.'
          : `Voice error: ${e.error}`
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  // ── Submit ────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.crop) return;
    if (!form.description.trim() && !imageBase64) return;
    onSubmit({ ...form, imageBase64, imageMimeType });
  }

  const ready = form.crop && (form.description.trim().length > 5 || imageBase64);

  return (
    <form className="form-card" onSubmit={handleSubmit}>

      <div className="field">
        <label>Crop *</label>
        <select value={form.crop} onChange={e => set('crop', e.target.value)} required>
          <option value="">Select your crop…</option>
          {KERALA_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="row-2">
        <div className="field">
          <label>District</label>
          <select value={form.district} onChange={e => set('district', e.target.value)}>
            <option value="">Select district…</option>
            {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Season</label>
          <select value={form.season} onChange={e => set('season', e.target.value)}>
            <option value="">Select season…</option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Photo upload */}
      <div className="field">
        <label>Photo of affected crop (optional)</label>
        {!imagePreview ? (
          <div className="photo-upload-zone" onClick={() => fileInputRef.current.click()}>
            <span className="upload-icon">📷</span>
            <span className="upload-text">Tap to upload a photo</span>
            <span className="upload-sub">JPG, PNG up to 5MB</span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>
        ) : (
          <div className="photo-preview-wrap">
            <img src={imagePreview} alt="Crop preview" className="photo-preview" />
            <button type="button" className="photo-remove" onClick={removeImage}>✕ Remove</button>
          </div>
        )}
      </div>

      {/* Description + voice button */}
      <div className="field">
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Describe the problem {imageBase64 ? '(optional)' : '*'}</span>
          <button
            type="button"
            className={`mic-btn ${isListening ? 'mic-active' : ''}`}
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : `Speak in ${form.language}`}
          >
            {isListening ? '⏹ Listening…' : '🎤 Speak'}
          </button>
        </label>

        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={
            isListening
              ? '🎤 Listening — speak now…'
              : 'e.g. Leaves turning yellow with brown spots, plant looks weak…'
          }
          required={!imageBase64}
          style={{ borderColor: isListening ? 'var(--leaf)' : undefined }}
        />

        {voiceError && (
          <p style={{ fontSize: 12, color: 'var(--sev-high)', marginTop: 5 }}>{voiceError}</p>
        )}
      </div>

      <div className="field">
        <label>Response language</label>
        <div className="lang-pills">
          {LANGUAGES.map(l => (
            <button key={l} type="button"
              className={`lang-pill ${form.language === l ? 'active' : ''}`}
              onClick={() => set('language', l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={!ready}>
        {ready ? `Diagnose my ${form.crop || 'crop'} →` : 'Select crop and describe problem'}
      </button>

    </form>
  );
}
