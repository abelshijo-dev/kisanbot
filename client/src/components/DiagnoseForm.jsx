import { useState, useRef, useEffect } from 'react';

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

const LANG_CODES = {
  'English': 'en-IN', 'Malayalam': 'ml-IN',
  'Hindi': 'hi-IN', 'Tamil': 'ta-IN',
};

// Coordinates for each Kerala district
const DISTRICT_COORDS = {
  'Thiruvananthapuram': { lat: 8.5241,  lng: 76.9366 },
  'Kollam':             { lat: 8.8932,  lng: 76.6141 },
  'Pathanamthitta':     { lat: 9.2648,  lng: 76.7870 },
  'Alappuzha':          { lat: 9.4981,  lng: 76.3388 },
  'Kottayam':           { lat: 9.5916,  lng: 76.5222 },
  'Idukki':             { lat: 9.9189,  lng: 77.1025 },
  'Ernakulam':          { lat: 9.9816,  lng: 76.2999 },
  'Thrissur':           { lat: 10.5276, lng: 76.2144 },
  'Palakkad':           { lat: 10.7867, lng: 76.6548 },
  'Malappuram':         { lat: 11.0730, lng: 76.0740 },
  'Kozhikode':          { lat: 11.2588, lng: 75.7804 },
  'Wayanad':            { lat: 11.6854, lng: 76.1320 },
  'Kannur':             { lat: 11.8745, lng: 75.3704 },
  'Kasaragod':          { lat: 12.4996, lng: 74.9869 },
};

// Fetch current weather from Open-Meteo (free, no API key needed)
async function fetchWeather(district) {
  const coords = DISTRICT_COORDS[district];
  if (!coords) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;

    return {
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      precipitation: c.precipitation,
      condition: getWeatherCondition(c.weather_code),
    };
  } catch {
    return null; // fail silently — weather is optional
  }
}

// Convert Open-Meteo weather code to human-readable string
function getWeatherCondition(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow/sleet';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export default function DiagnoseForm({ onSubmit }) {
  const [form, setForm] = useState({
    crop: '', district: '', season: '', description: '', language: 'English',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMimeType, setImageMimeType] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const fileInputRef = useRef();
  const recognitionRef = useRef(null);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  // Fetch weather whenever district changes
  useEffect(() => {
    if (!form.district) { setWeather(null); return; }
    setWeatherLoading(true);
    fetchWeather(form.district).then(w => {
      setWeather(w);
      setWeatherLoading(false);
    });
  }, [form.district]);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input not supported. Try Chrome.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[form.language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      set('description', form.description ? form.description + ' ' + transcript : transcript);
    };
    recognition.onerror = (e) => {
      setVoiceError(e.error === 'not-allowed'
        ? 'Microphone permission denied.'
        : `Voice error: ${e.error}`);
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
    // Pass weather data along with the form
    onSubmit({ ...form, imageBase64, imageMimeType, weather });
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

      {/* Weather widget — shows after district selected */}
      {form.district && (
        <div className="weather-widget">
          {weatherLoading ? (
            <span className="weather-loading">🌤 Fetching weather for {form.district}…</span>
          ) : weather ? (
            <div className="weather-row">
              <span className="weather-title">Current weather in {form.district}</span>
              <div className="weather-stats">
                <span>🌡 {weather.temperature}°C</span>
                <span>💧 {weather.humidity}% humidity</span>
                <span>🌧 {weather.precipitation}mm rain</span>
                <span>☁ {weather.condition}</span>
              </div>
              <span className="weather-note">This will improve your diagnosis accuracy</span>
            </div>
          ) : (
            <span className="weather-loading">Could not fetch weather — diagnosis will still work</span>
          )}
        </div>
      )}

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

      {/* Description + voice */}
      <div className="field">
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Describe the problem {imageBase64 ? '(optional)' : '*'}</span>
          <button type="button"
            className={`mic-btn ${isListening ? 'mic-active' : ''}`}
            onClick={toggleVoice}
            title={isListening ? 'Stop listening' : `Speak in ${form.language}`}>
            {isListening ? '⏹ Listening…' : '🎤 Speak'}
          </button>
        </label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={isListening ? '🎤 Listening — speak now…' : 'e.g. Leaves turning yellow with brown spots…'}
          required={!imageBase64}
          style={{ borderColor: isListening ? 'var(--leaf)' : undefined }}
        />
        {voiceError && <p style={{ fontSize: 12, color: 'var(--sev-high)', marginTop: 5 }}>{voiceError}</p>}
      </div>

      <div className="field">
        <label>Response language</label>
        <div className="lang-pills">
          {LANGUAGES.map(l => (
            <button key={l} type="button"
              className={`lang-pill ${form.language === l ? 'active' : ''}`}
              onClick={() => set('language', l)}>{l}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={!ready}>
        {ready ? `Diagnose my ${form.crop} →` : 'Select crop and describe problem'}
      </button>

    </form>
  );
}
