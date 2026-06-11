
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config.js';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  useEffect(() => {
    setupRecaptcha();
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  function setupRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'normal', // changed from invisible to normal
    callback: (response) => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      window.recaptchaVerifier = null;
    }
  });
  window.recaptchaVerifier.render();
}


  async function sendOTP() {
  setError('');
  if (!phone || phone.length < 10) {
    setError('Enter a valid 10-digit phone number');
    return;
  }

  setLoading(true);
  try {
    const phoneNumber = `+91${phone}`;
    const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    setConfirmationResult(result);
    setStep('otp');
  } catch (err) {
    console.error(err);
    setError('Could not send OTP. Check your number and try again.');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  } finally {
    setLoading(false);
  }
}
  async function verifyOTP() {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      onLogin(); // tell parent login succeeded
    } catch (err) {
      console.error(err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span className="nav-logo">Kisan<span>Bot</span></span>
        </div>

        <h2 className="login-title">
          {step === 'phone' ? 'Welcome, farmer 🌾' : 'Enter OTP'}
        </h2>
        <p className="login-sub">
          {step === 'phone'
            ? 'Log in with your mobile number to save your diagnoses'
            : `We sent a 6-digit OTP to +91 ${phone}`}
        </p>

        {step === 'phone' ? (
          <>
            <div className="field">
              <label>Mobile number</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              className="btn-submit"
              onClick={sendOTP}
              disabled={loading || phone.length < 10}
            >
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </button>

            <button className="login-skip" onClick={onLogin}>
              Skip — continue without login
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label>6-digit OTP</label>
              <input
                type="tel"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              className="btn-submit"
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>

            <button className="login-skip" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
              ← Change number
            </button>
          </>
        )}

        {/* Invisible recaptcha container */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
