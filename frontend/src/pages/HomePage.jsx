import React, { useState, useEffect } from 'react';
import { journeySteps } from '../data/mockData';
import { getPlatformStats } from '../services/api';
import { translations } from '../data/translations';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function HomePage({ setActiveScreen, language = 'en' }) {
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [stats, setStats] = useState({
    reportsReceived: '0',
    challengesIdentified: '0',
    projectsInProgress: '0',
    solutionsDeployed: '0',
    peopleBenefited: '0'
  });

  const hindiJourneySteps = [
    { step: 1, title: "नागरिक", subtitle: "समस्या रिपोर्ट करें", color: "#2563EB", desc: "नागरिक टेक्स्ट, फोटो, जीपीएस या वॉइस नोट के माध्यम से स्थानीय मुद्दे दर्ज करते हैं।" },
    { step: 2, title: "एआई", subtitle: "समझे और समूहीकृत करे", color: "#16A34A", desc: "एआई प्रमाणिकता जांचता है, डुप्लिकेट हटाता है और गंभीरता तय करता है।" },
    { step: 3, title: "विश्वविद्यालय", subtitle: "समाधान बनाएं", color: "#0D9488", desc: "छात्र व शिक्षक प्रोटोटाइप विकसित करते हैं और NEP 2020 क्रेडिट पाते हैं।" },
    { step: 4, title: "उद्योग", subtitle: "अनुदान और सहयोग", color: "#EA580C", desc: "उद्योग व CSR भागीदार फंड और तकनीकी मार्गदर्शन प्रदान करते हैं।" },
    { step: 5, title: "सरकार", subtitle: "मंजूरी और क्रियान्वयन", color: "#1E3A8A", desc: "जिला प्रशासन फील्ड परीक्षण और आधिकारिक स्वीकृति प्रदान करता है।" },
    { step: 6, title: "प्रभाव", subtitle: "बेहतर भविष्य", color: "#DC2626", desc: "सत्यापित समाधान की तैनाती, IoT निगरानी और नागरिक को समाधान सूचना।" }
  ];

  const activeSteps = language === 'hi' ? hindiJourneySteps : journeySteps;

  useEffect(() => {
    async function loadStats() {
      try {
        const live = await getPlatformStats();
        if (live) {
          setStats({
            reportsReceived: live.reportsReceived || '0',
            challengesIdentified: live.challengesIdentified || '0',
            projectsInProgress: live.projectsInProgress || '0',
            solutionsDeployed: live.solutionsDeployed || '0',
            peopleBenefited: live.peopleBenefited || '0'
          });
        }
      } catch (err) {
        console.warn('Using local stats fallback');
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '64px 0 54px 0',
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Hero Text */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              <Sparkles size={15} />
              {t('motto')}
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#0F2C59',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              {t('heroTitle1')} <span style={{ color: '#16A34A' }}>{t('heroTitle2')}</span>
            </h1>

            <p style={{
              fontSize: '16.5px',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              {t('heroSub')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button 
                onClick={() => setActiveScreen('report')}
                className="btn btn-primary" 
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                {t('reportProblem')}
                <ArrowRight size={17} />
              </button>
              <button 
                onClick={() => setActiveScreen('challenges')}
                className="btn btn-outline" 
                style={{ padding: '12px 26px', fontSize: '15px' }}
              >
                {t('challenges')}
              </button>
            </div>
          </div>

          {/* Right Hero Graphic with Emblem Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: '24px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '420px',
              boxShadow: '0 20px 25px -5px rgba(15, 44, 89, 0.08)'
            }}>
              <img 
                src="/assets/logo.png" 
                alt="SamadhanSetu Emblem" 
                style={{ width: '220px', height: '220px', objectFit: 'contain', margin: '0 auto 20px auto' }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                {language === 'hi' ? 'समाधानसेतु डिजिटल इंजन' : 'SamadhanSetu Digital Engine'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                {language === 'hi' ? 'झारखंड के 24 जिलों को राज्य विश्वविद्यालयों, सीएसआर फंड और नोडल अधिकारियों से जोड़ना।' : 'Bridging 24 Districts of Jharkhand with State Universities, CSR Grants, and Nodal Officers.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Bar */}
      <section style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '36px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F2C59' }}>{stats.reportsReceived}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{t('reportsReceived')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#16A34A' }}>{stats.challengesIdentified}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{t('challengesIdentified')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#EA580C' }}>{stats.projectsInProgress}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{t('projectsInProgress')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0D9488' }}>{stats.solutionsDeployed}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{t('solutionsDeployed')}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#DC2626' }}>{stats.peopleBenefited}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{t('peopleBenefited')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Complete Journey (6 Stages) */}
      <section style={{ padding: '64px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#16A34A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {t('processTitle')}
            </h2>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0F2C59' }}>
              {t('journeyHeader')}
            </h3>
            <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px' }}>
              {t('journeySub')}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '18px'
          }}>
            {activeSteps.map((s) => (
              <div 
                key={s.step} 
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  borderTop: `4px solid ${s.color}`
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9999px',
                  backgroundColor: s.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  margin: '0 auto 12px auto'
                }}>
                  {s.step}
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0F2C59', marginBottom: '4px' }}>
                  {s.title}
                </h4>
                <p style={{ fontSize: '12px', fontWeight: 600, color: s.color, marginBottom: '8px' }}>
                  {s.subtitle}
                </p>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button 
              onClick={() => setActiveScreen('report')}
              className="btn btn-primary"
              style={{ padding: '14px 36px', fontSize: '15px' }}
            >
              {t('startContributing')}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

