import React from 'react';
import { Search, Globe, Shield, User, Lock, Unlock, LogOut } from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({ activeScreen, setActiveScreen, currentUser, setCurrentUser, language = 'en', toggleLanguage }) {
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  // Public links shown before authentication
  const publicNavLinks = [
    { id: 'home', label: t('home') },
    { id: 'impact', label: t('impact') },
    { id: 'about', label: t('about') },
  ];

  // Full links unlocked after login, signup, and authentication
  const authenticatedNavLinks = [
    { id: 'home', label: t('home') },
    { id: 'report', label: t('reportProblem') },
    { id: 'challenges', label: t('challenges') },
    { id: currentUser?.role === 'University' ? 'university' : currentUser?.role === 'Industry' ? 'industry' : currentUser?.role === 'Government' ? 'government' : 'challenges', label: t('dashboard') },
    { id: 'workspace', label: t('workspace') },
    { id: 'impact', label: t('impact') },
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
              {t('tagline')}
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
                <option value="home">{t('home')}</option>
                <option value="report">{t('reportProblem')}</option>
                <option value="ai-result">AI Analysis Result</option>
                <option value="challenges">{t('challenges')}</option>
                <option value="university">University Dashboard</option>
                <option value="industry">Industry Dashboard</option>
                <option value="government">Government Dashboard</option>
                <option value="workspace">{t('workspace')}</option>
                <option value="impact">{t('impact')}</option>
                <option value="about">{t('about')}</option>
              </>
            ) : (
              // ONLY PUBLIC PAGES BEFORE AUTHENTICATION
              <>
                <option value="home">{t('home')}</option>
                <option value="signup">{t('signUp')}</option>
                <option value="login">{t('login')}</option>
                <option value="impact">{t('impact')}</option>
                <option value="about">{t('about')}</option>
              </>
            )}
          </select>
        </nav>

        {/* Action Buttons, Language Toggle & Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: language === 'hi' ? '#EFF6FF' : '#F8FAFC',
              color: language === 'hi' ? '#1D4ED8' : '#0F2C59',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            title={language === 'en' ? 'Switch to Hindi (हिंदी में बदलें)' : 'Switch to English'}
          >
            <Globe size={15} color={language === 'hi' ? '#1D4ED8' : '#16A34A'} />
            <span>{language === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
          </button>

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
                {t('logout')}
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setActiveScreen('login')}
                className="btn btn-outline" 
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                {t('login')}
              </button>
              <button 
                onClick={() => setActiveScreen('signup')}
                className="btn btn-primary" 
                style={{ padding: '8px 18px', fontSize: '13.5px' }}
              >
                {t('signUp')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

