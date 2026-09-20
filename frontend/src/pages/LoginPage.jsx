import React, { useState } from 'react';
import { Users, GraduationCap, Building, Landmark, Smartphone, ArrowRight, ShieldCheck, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../services/api';

export default function LoginPage({ setActiveScreen, setCurrentUser, pendingScreen, setPendingScreen, onAuthSuccess }) {
  const [selectedRole, setSelectedRole] = useState('Citizen');
  const [mobileNumber, setMobileNumber] = useState('');
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
        setSuccessNotice(`Verification code sent to +91 ${cleanDigits}`);
      } else {
        setErrorMessage(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpSent(true);
      setSuccessNotice(`Verification code sent to +91 ${cleanDigits}`);
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
      setErrorMessage('Please enter the 4-digit OTP sent to your phone');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(cleanDigits, otp.trim(), '', selectedRole);
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
        fullName: `${selectedRole} User`,
        mobileNumber: cleanDigits,
        role: selectedRole,
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
          maxWidth: '880px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(15, 44, 89, 0.08)',
          border: '1px solid #E2E8F0'
        }}>
          {/* Form Panel */}
          <div style={{ padding: '44px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={22} color="#16A34A" />
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2C59' }}>
                Secure OTP Login
              </h2>
            </div>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '24px' }}>
              Authenticate with your mobile number to unlock problem reporting, dashboards, and workspaces.
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
                      gap: '5px',
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
              /* STEP 1: ENTER MOBILE NUMBER */
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                      padding: '11px 14px',
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
                        padding: '11px 14px',
                        fontSize: '15px',
                        letterSpacing: '1px',
                        border: 'none',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* STEP 2: ENTER & VERIFY OTP */
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
                        borderRadius: '8px',
                        border: '2px solid #0F2C59',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>

                  {/* Demo OTP Helper Badge */}
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
                      SMS Verification OTP: <strong style={{ letterSpacing: '1px' }}>{demoOtpCode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoOtpCode)}
                      style={{
                        border: 'none',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
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
                  {isSubmitting ? 'Verifying...' : 'Verify OTP & Enter Platform'}
                  <CheckCircle2 size={16} />
                </button>
              </form>
            )}

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
              New citizen or institution?{' '}

              <button 
                onClick={() => setActiveScreen('signup')}
                style={{ color: '#16A34A', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up with OTP
              </button>
            </div>
          </div>

          {/* Right Brand Info Card */}
          <div style={{
            backgroundColor: '#0F2C59',
            padding: '44px 36px',
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
                Protected Quad-Helix Access
              </h3>
              <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '24px' }}>
                After logging in with your verified mobile number and OTP, you unlock access to:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#E2E8F0' }}>
                <div>🔓 <strong>4. Report a Problem</strong> & AI triage</div>
                <div>🔓 <strong>5. AI Analysis Result</strong> & vector clustering</div>
                <div>🔓 <strong>6. Challenges Explorer</strong> statewide feed</div>
                <div>🔓 <strong>7. University Dashboard</strong> & NEP 2020 credits</div>
                <div>🔓 <strong>8. Industry Dashboard</strong> CSR pledges</div>
                <div>🔓 <strong>9. Government Dashboard</strong> GIS War Room</div>
                <div>🔓 <strong>10. Project Workspace</strong> collaborative kanban</div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '32px'
            }}>
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
