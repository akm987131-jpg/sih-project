import React from 'react';
import { platformStats, journeySteps } from '../data/mockData';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

export default function HomePage({ setActiveScreen }) {
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
              Stronger Communities, Brighter India
            </div>

            <h1 style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#0F2C59',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              Turn Societal Problems Into <span style={{ color: '#16A34A' }}>Real Solutions</span>
            </h1>

            <p style={{
              fontSize: '16.5px',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              A collaborative crowdsourcing platform where citizens report, AI understands, universities innovate, industry supports, and government enables for a better tomorrow.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button 
                onClick={() => setActiveScreen('report')}
                className="btn btn-primary" 
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                Report a Problem
                <ArrowRight size={17} />
              </button>
              <button 
                onClick={() => setActiveScreen('challenges')}
                className="btn btn-outline" 
                style={{ padding: '12px 26px', fontSize: '15px' }}
              >
                Explore Challenges
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
                SamadhanSetu Digital Engine
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                Bridging 24 Districts of Jharkhand with State Universities, CSR Grants, and Nodal Officers.
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
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F2C59' }}>{platformStats.reportsReceived}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>Reports Received</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#16A34A' }}>{platformStats.challengesIdentified}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>Challenges Identified</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#EA580C' }}>{platformStats.projectsInProgress}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>Projects in Progress</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#0D9488' }}>{platformStats.solutionsDeployed}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>Solutions Deployed</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#DC2626' }}>{platformStats.peopleBenefited}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>People Benefited</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Complete Journey (6 Stages) */}
      <section style={{ padding: '64px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#16A34A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Process Architecture
            </h2>
            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0F2C59' }}>
              THE COMPLETE JOURNEY
            </h3>
            <p style={{ fontSize: '15px', color: '#64748B', marginTop: '8px' }}>
              From a citizen's single voice note to an engineered, sanctioned, and deployed field solution.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '18px'
          }}>
            {journeySteps.map((s) => (
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
              Start Your Contribution Today
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
