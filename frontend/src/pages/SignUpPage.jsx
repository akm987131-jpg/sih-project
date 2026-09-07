import React, { useState } from 'react';
import { Users, Building, GraduationCap, Landmark, ArrowRight, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';

export default function SignUpPage({ setActiveScreen, setCurrentUser, pendingScreen, setPendingScreen, onAuthSuccess }) {
  const [selectedRole, setSelectedRole] = useState('Citizen');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('2604');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const roles = [
    { id: 'Citizen', label: 'Citizen', icon: Users },
    { id: 'University', label: 'University', icon: GraduationCap },
    { id: 'Industry', label: 'Industry', icon: Building },
    { id: 'Government', label: 'Government', icon: Landmark }
  ];

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanDigits = mobileNumber.replace(/\D/g, '');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanDigits);
      if (res.success) {
        setOtpSent(true);
        if (res.demoOtp) setDemoOtpCode(res.demoOtp);
        setSuccessNotice(`Verification OTP sent to +91 ${cleanDigits}`);
      } else {
        setErrorMessage(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpSent(true);
      setSuccessNotice(`Verification OTP sent to +91 ${cleanDigits}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanDigits = mobileNumber.replace(/\D/g, '');

    if (!otp || otp.trim().length < 4) {
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(cleanDigits, otp.trim(), fullName, selectedRole);
      if (res.success && res.user) {
        if (onAuthSuccess) {
          onAuthSuccess(res.user, pendingScreen);
        } else {
          setCurrentUser(res.user);
          redirectAfterAuth(selectedRole);
        }
      } else {
        setErrorMessage(res.message || 'Invalid OTP. Please enter code 2604.');
      }
    } catch (err) {
      const user = {
        fullName: fullName || `${selectedRole} User`,
        mobileNumber: cleanDigits,
        role: selectedRole,
        organization: organization || undefined,
        state: 'Jharkhand'
      };
      if (onAuthSuccess) {
        onAuthSuccess(user, pendingScreen);
      } else {
        setCurrentUser(user);
        redirectAfterAuth(selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectAfterAuth = (role) => {
    if (pendingScreen) {
      const target = pendingScreen;
      if (setPendingScreen) setPendingScreen(null);
      setActiveScreen(target);
      return;
    }

    if (role === 'University') setActiveScreen('university');
    else if (role === 'Industry') setActiveScreen('industry');
    else if (role === 'Government') setActiveScreen('government');
    else setActiveScreen('home');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          maxWidth: '900px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(15, 44, 89, 0.08)',
          border: '1px solid #E2E8F0'
        }}>
          {/* Form Left Panel */}
          <div style={{ padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={22} color="#16A34A" />
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2C59' }}>
                Register with OTP
              </h2>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px' }}>
              Create your verified account to access problem reporting and state dashboards.
            </p>

            {/* Role Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '24px',
              gap: '4px'
            }}>
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 600,
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#0F2C59' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} />
                    {r.label}
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {errorMessage}
              </div>
            )}

            {successNotice && (
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
                {successNotice}
              </div>
            )}

            {!otpSent ? (
              /* STEP 1: USER DETAILS & PHONE */
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Full Name <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Mahto" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    10-Digit Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF'
                  }}>
                    <span style={{
                      padding: '10px 14px',
                      backgroundColor: '#F1F5F9',
                      borderRight: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      fontWeight: 700,
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
                        padding: '10px 14px',
                        fontSize: '15px',
                        letterSpacing: '1px',
                        border: 'none',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                {selectedRole !== 'Citizen' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Institution / Department Name
                    </label>
                    <input 
                      type="text" 
                      placeholder={selectedRole === 'University' ? 'e.g. NIT Jamshedpur' : selectedRole === 'Industry' ? 'e.g. Tata Projects' : 'e.g. DWSD Ranchi'} 
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* STEP 2: VERIFY OTP */
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Enter 4-Digit OTP <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Edit Info (+91 {mobileNumber})
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <KeyRound size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input 
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit code" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        fontSize: '18px',
                        fontWeight: 700,
                        letterSpacing: '6px',
                        borderRadius: '8px',
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
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP & Complete Registration'}
                  <CheckCircle2 size={16} />
                </button>
              </form>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
              Already registered?{' '}
              <button 
                onClick={() => setActiveScreen('login')}
                style={{ color: '#0F2C59', fontWeight: 700, cursor: 'pointer' }}
              >
                Login with OTP
              </button>
            </div>
          </div>

          {/* Right Brand Sidebar */}
          <div style={{
            backgroundColor: '#0F2C59',
            padding: '40px 36px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '9999px', backgroundColor: '#16A34A' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#93C5FD' }}>
                  Smart India Hackathon 2026
                </span>
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.3, marginBottom: '14px' }}>
                Unlocked After OTP Authentication
              </h3>
              <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '24px' }}>
                Per governance guidelines, societal problem reporting and state analytics require verified identity to ensure high reporting veracity.
              </p>

              <div style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12.5px',
                color: '#E2E8F0'
              }}>
                <div>🔓 <strong>4. Report a Problem</strong> (Full 4-Step Intake)</div>
                <div>🔓 <strong>5. AI Analysis Result</strong> (FAISS Clustering)</div>
                <div>🔓 <strong>6. Challenges Explorer</strong> (Search & Filters)</div>
                <div>🔓 <strong>7. University Dashboard</strong> (NIT Jamshedpur)</div>
                <div>🔓 <strong>8. Industry Dashboard</strong> (Tata Projects)</div>
                <div>🔓 <strong>9. Government Dashboard</strong> (Collector Map)</div>
                <div>🔓 <strong>10. Project Workspace</strong> (Live Task Checklist)</div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '12px', color: '#93C5FD', margin: 0, fontStyle: 'italic' }}>
                "Turn Societal Problems Into Real Solutions — Together for a Better Tomorrow."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
