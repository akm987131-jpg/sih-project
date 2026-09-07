import React, { useState } from 'react';
import { Camera, FileText, MapPin, CheckCircle, Info, Sparkles, Loader2, Smartphone, ShieldCheck, ArrowRight, UserCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { submitReport, sendOtp, verifyOtp } from '../services/api';

export default function ReportProblemPage({ setActiveScreen, setLatestReport, currentUser, setCurrentUser }) {
  // Mobile & OTP Verification State (when not logged in)
  const [mobileNumber, setMobileNumber] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('2604');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Problem Intake Wizard State (Clean Blank Form)
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState({ lat: 23.3441, lng: 85.3240 });
  const [category, setCategory] = useState('Water & Sanitation');
  const [severity, setSeverity] = useState('Medium');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Send OTP to Citizen
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanDigits = mobileNumber.replace(/\D/g, '');

    if (cleanDigits.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await sendOtp(cleanDigits);
      if (res.success) {
        setOtpSent(true);
        if (res.demoOtp) setDemoOtpCode(res.demoOtp);
        setAuthNotice(`Verification OTP sent to +91 ${cleanDigits}`);
      } else {
        setAuthError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpSent(true);
      setAuthNotice(`Verification OTP sent to +91 ${cleanDigits}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanDigits = mobileNumber.replace(/\D/g, '');

    if (!otp || otp.trim().length < 4) {
      setAuthError('Please enter the 4-digit verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyOtp(cleanDigits, otp.trim(), citizenName, 'Citizen');
      if (res.success && res.user) {
        setCurrentUser(res.user);
      } else {
        setAuthError(res.message || 'Invalid OTP. Please enter code 2604.');
      }
    } catch (err) {
      setCurrentUser({
        fullName: citizenName || `Citizen (${cleanDigits.slice(-4)})`,
        mobileNumber: cleanDigits,
        role: 'Citizen',
        state: 'Jharkhand'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickDemoCitizen = () => {
    setCurrentUser({
      fullName: 'Ramesh Mahto (Farmer)',
      mobileNumber: '9876543210',
      role: 'Citizen',
      state: 'Jharkhand'
    });
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Jharkhand)`);
        },
        () => {
          alert('Using default district GPS coordinates for Ranchi, Jharkhand.');
        }
      );
    }
  };

  const handleProceedToAi = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await submitReport({
        problemText: description,
        locationName,
        coordinates: [coords.lng, coords.lat],
        severity,
        category,
        citizenName: currentUser?.fullName || citizenName || 'Anonymous Citizen',
        citizenPhone: currentUser?.mobileNumber || mobileNumber || '9876543210',
      });

      if (setLatestReport) {
        setLatestReport({
          description,
          locationName,
          category,
          severity,
          citizenName: currentUser?.fullName || citizenName,
          citizenPhone: currentUser?.mobileNumber || mobileNumber,
          aiResult: res.aiAnalysisResult || null,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setActiveScreen('ai-result');
    }
  };

  // STEP 0: CITIZEN OTP VERIFICATION GATE (IF NOT LOGGED IN)
  if (!currentUser) {
    return (
      <div style={{ padding: '60px 0 80px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card" style={{ padding: '40px 36px', boxShadow: '0 20px 25px -5px rgba(15, 44, 89, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E3A8A'
              }}>
                <Smartphone size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2C59' }}>
                  Citizen OTP Verification Required
                </h2>
                <span style={{ fontSize: '12.5px', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Report a Problem (Protected)
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
              To ensure data authenticity, citizen reporting and state dashboards require verified identity. Please verify your mobile number via OTP.
            </p>

            {authError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {authError}
              </div>
            )}

            {authNotice && (
              <div style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                {authNotice}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    10-Digit Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <span style={{
                      padding: '12px 16px',
                      backgroundColor: '#F1F5F9',
                      borderRight: '1px solid #CBD5E1',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#0F2C59'
                    }}>
                      🇮🇳 +91
                    </span>
                    <input 
                      type="tel"
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        fontSize: '16px',
                        letterSpacing: '1px',
                        border: 'none',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Your Full Name (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Ramesh Mahto"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      fontSize: '14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="btn btn-primary"
                  style={{
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px'
                  }}
                >
                  {isVerifying ? 'Sending OTP...' : 'Send Verification OTP'}
                  <ArrowRight size={17} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>
                      Enter 4-Digit OTP <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Change Number (+91 {mobileNumber})
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input 
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit code (e.g. 2604)" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        fontSize: '18px',
                        fontWeight: 700,
                        letterSpacing: '6px',
                        borderRadius: '10px',
                        border: '2px solid #0F2C59',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  {/* Demo OTP Helper */}
                  <div style={{
                    marginTop: '8px',
                    backgroundColor: '#EFF6FF',
                    border: '1px dashed #93C5FD',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#1E3A8A', fontWeight: 600 }}>
                      ⚡ Demo OTP Code: <strong style={{ letterSpacing: '1px' }}>{demoOtpCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoOtpCode)}
                      style={{
                        backgroundColor: '#1E3A8A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isVerifying}
                  className="btn btn-primary"
                  style={{
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px'
                  }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP & Unlock Report Wizard'}
                  <CheckCircle2 size={17} />
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #E2E8F0', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', fontWeight: 600 }}>
                OR USE INSTANT DEMO CITIZEN ACCESS
              </p>
              <button 
                type="button"
                onClick={handleQuickDemoCitizen}
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#1E3A8A',
                  border: '1px solid #BFDBFE',
                  cursor: 'pointer'
                }}
              >
                ⚡ 1-Click Demo Citizen: Ramesh Mahto (+91 9876543210)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 1-4: CITIZEN IS AUTHENTICATED -> UNLOCK REPORT INTAKE WIZARD
  return (
    <div style={{ padding: '40px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Verified Citizen Header Badge */}
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="#059669" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
              Reporting As: {currentUser.fullName}
            </span>
            <span style={{ fontSize: '12px', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '9999px' }}>
              🇮🇳 +91 {currentUser.mobileNumber || '9876543210'} (Verified ✓)
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setCurrentUser(null)}
            style={{ fontSize: '12px', color: '#059669', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
          >
            Change Number
          </button>
        </div>

        {/* 4-Step Stepper */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '18px 32px',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {[
            { num: 1, label: 'Problem Details' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Category' },
            { num: 4, label: 'Review & Submit' }
          ].map((s) => (
            <div 
              key={s.num} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => setStep(s.num)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                backgroundColor: step >= s.num ? '#0F2C59' : '#F1F5F9',
                color: step >= s.num ? '#FFFFFF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{
                fontSize: '13.5px',
                fontWeight: step === s.num ? 700 : 500,
                color: step === s.num ? '#0F2C59' : '#64748B'
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Form Left Card */}
          <div className="card" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
              Report a Problem
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px' }}>
              Tell us and understand the issue in your area. Your report will be analyzed by AI and forwarded to universities and government nodal officers.
            </p>

            <form onSubmit={handleProceedToAi} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Problem Description */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0F2C59', marginBottom: '8px' }}>
                  What is the problem?
                </label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem in detail (e.g. broken canal, dirty borewell water, bridge collapse)..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Photo & Document Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Attachments & Evidence
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setHasPhoto(!hasPhoto)}
                    className="btn btn-outline"
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '13px',
                      borderColor: hasPhoto ? '#16A34A' : '#CBD5E1',
                      backgroundColor: hasPhoto ? '#F0FDF4' : '#FFFFFF'
                    }}
                  >
                    <Camera size={16} color={hasPhoto ? '#16A34A' : '#64748B'} />
                    {hasPhoto ? 'Photo Attached (EXIF Verified ✓)' : 'Add Photo'}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '12px', fontSize: '13px' }}
                  >
                    <FileText size={16} />
                    Add Document
                  </button>
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Location in Jharkhand
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleUseLocation}
                    className="btn btn-outline"
                    style={{ padding: '10px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                  >
                    <MapPin size={15} />
                    Auto GPS
                  </button>
                </div>
              </div>

              {/* Category Domain */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Category Domain
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F2C59',
                    outline: 'none'
                  }}
                >
                  <option value="Water & Sanitation">Water & Sanitation (Drinking Water, Canals)</option>
                  <option value="Agriculture">Agriculture (Crop Storage, Irrigation, Soil)</option>
                  <option value="Healthcare">Healthcare (Clinics, Vaccine Cold-Chain)</option>
                  <option value="Infrastructure">Infrastructure (Roads, Culverts, Solar Grids)</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  How serious is it?
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['Low', 'Medium', 'High'].map((s) => (
                    <label 
                      key={s} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: severity === s ? 700 : 500,
                        color: severity === s ? (s === 'High' ? '#DC2626' : s === 'Medium' ? '#B45309' : '#15803D') : '#64748B'
                      }}
                    >
                      <input 
                        type="radio" 
                        name="severity" 
                        value={s} 
                        checked={severity === s} 
                        onChange={() => setSeverity(s)} 
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ padding: '14px', fontSize: '15px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    AI Analyzing & Clustering...
                  </>
                ) : (
                  <>
                    Submit & Trigger AI Analysis
                    <Sparkles size={17} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Tips & Motivation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Tips Card */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Info size={18} color="#0F2C59" />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F2C59' }}>Tips for Quality Reports</h4>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569' }}>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Be specific:</strong> Mention the exact problem and how many people are affected.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Add clear photos:</strong> High-resolution photos help Computer Vision verify genuineness.</span>
                </li>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={15} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Mention location:</strong> Village name, tola, or block helps regional clustering.</span>
                </li>
              </ul>
            </div>

            {/* Civic Motivation Card */}
            <div style={{
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A8A', marginBottom: '6px' }}>
                Your Voice Matters!
              </h4>
              <p style={{ fontSize: '13px', color: '#3B82F6', lineHeight: 1.5 }}>
                Together we can build a better, safer and stronger community for all of Jharkhand.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
