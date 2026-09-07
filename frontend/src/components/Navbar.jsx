import React from 'react';
import { Search, Globe, Shield, User, Lock, Unlock, LogOut } from 'lucide-react';

export default function Navbar({ activeScreen, setActiveScreen, currentUser, setCurrentUser }) {
  // Public links shown before authentication
  const publicNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'impact', label: 'Impact' },
    { id: 'about', label: 'About' },
  ];

  // Full links unlocked after login, signup, and authentication
  const authenticatedNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report Problem' },
    { id: 'challenges', label: 'Challenges' },
    { id: currentUser?.role === 'University' ? 'university' : currentUser?.role === 'Industry' ? 'industry' : currentUser?.role === 'Government' ? 'government' : 'challenges', label: 'Dashboard' },
    { id: 'workspace', label: 'Workspace' },
    { id: 'impact', label: 'Impact' },
  ];

  const navLinks = currentUser ? authenticatedNavLinks : publicNavLinks;

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(15, 44, 89, 0.04)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px'
      }}>
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveScreen('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img 
            src="/assets/logo.png" 
            alt="SamadhanSetu Logo" 
            style={{ width: '46px', height: '46px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F2C59', letterSpacing: '-0.5px' }}>Samadhan</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', letterSpacing: '-0.5px' }}>Setu</span>
            </div>
            <p style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              People. Ideas. Impact.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveScreen(link.id)}
              style={{
                fontSize: '14.5px',
                fontWeight: activeScreen === link.id ? 700 : 500,
                color: activeScreen === link.id ? '#0F2C59' : '#475569',
                borderBottom: activeScreen === link.id ? '2px solid #0F2C59' : '2px solid transparent',
                padding: '6px 0',
                transition: 'all 0.15s ease'
              }}
            >
              {link.label}
            </button>
          ))}

          {/* Quick Screen Switcher Dropdown (Protected Pages 4-10 Unlock After Login) */}
          <select 
            value={activeScreen}
            onChange={(e) => setActiveScreen(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0F2C59',
              backgroundColor: currentUser ? '#F0FDF4' : '#F8FAFC',
              border: currentUser ? '1px solid #86EFAC' : '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {currentUser ? (
              // ALL PAGES UNLOCKED AFTER LOGIN & AUTHENTICATION
              <>
                <option value="home">Home</option>
                <option value="report">Report a Problem</option>
                <option value="ai-result">AI Analysis Result</option>
                <option value="challenges">Challenges Explorer</option>
                <option value="university">University Dashboard</option>
                <option value="industry">Industry Dashboard</option>
                <option value="government">Government Dashboard</option>
                <option value="workspace">Project Workspace</option>
                <option value="impact">Impact</option>
                <option value="about">About</option>
              </>
            ) : (
              // ONLY PUBLIC PAGES BEFORE AUTHENTICATION
              <>
                <option value="home">Home</option>
                <option value="signup">User Registration (Sign Up)</option>
                <option value="login">Login (OTP Verify)</option>
                <option value="impact">Impact</option>
                <option value="about">About</option>
              </>
            )}
          </select>
        </nav>

        {/* Action Buttons & Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                padding: '4px 10px', 
                backgroundColor: '#DCFCE7', 
                color: '#15803D', 
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700 
              }}>
                ✓ {currentUser.role}
              </span>
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  setActiveScreen('home');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px',
                  color: '#DC2626',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setActiveScreen('login')}
                className="btn btn-outline" 
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                Login
              </button>
              <button 
                onClick={() => setActiveScreen('signup')}
                className="btn btn-primary" 
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
