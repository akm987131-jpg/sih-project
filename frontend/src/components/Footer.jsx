import React from 'react';

export default function Footer({ setActiveScreen }) {
  return (
    <footer style={{ backgroundColor: '#0F2C59', color: '#F8FAFC', paddingTop: '48px', paddingBottom: '32px' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>Samadhan</span>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#22C55E' }}>Setu</span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px' }}>
              A collaborative crowdsourcing platform transforming rural grassroots challenges into high-impact, university-engineered, and government-deployed solutions.
            </p>
            <span style={{ 
              display: 'inline-block',
              fontSize: '11px', 
              fontWeight: 700, 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '4px 10px', 
              borderRadius: '4px',
              color: '#38BDF8' 
            }}>
              Smart India Hackathon 2026 • PS 26043
            </span>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#FFFFFF' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#CBD5E1' }}>
              <li><button onClick={() => setActiveScreen('home')} style={{ color: 'inherit' }}>Home Page</button></li>
              <li><button onClick={() => setActiveScreen('report')} style={{ color: 'inherit' }}>Report a Problem</button></li>
              <li><button onClick={() => setActiveScreen('challenges')} style={{ color: 'inherit' }}>Challenges Explorer</button></li>
              <li><button onClick={() => setActiveScreen('impact')} style={{ color: 'inherit' }}>Impact & Telemetry</button></li>
            </ul>
          </div>

          {/* Role Portals */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#FFFFFF' }}>Stakeholder Portals</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#CBD5E1' }}>
              <li><button onClick={() => setActiveScreen('university')} style={{ color: 'inherit' }}>University Dashboard</button></li>
              <li><button onClick={() => setActiveScreen('industry')} style={{ color: 'inherit' }}>Industry CSR Marketplace</button></li>
              <li><button onClick={() => setActiveScreen('government')} style={{ color: 'inherit' }}>Government GIS War Room</button></li>
              <li><button onClick={() => setActiveScreen('workspace')} style={{ color: 'inherit' }}>Collaborative Workspace</button></li>
            </ul>
          </div>

          {/* Organization & Theme */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#FFFFFF' }}>Nodal Organization</h4>
            <p style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '8px' }}>
              <strong>Government of Jharkhand</strong>
            </p>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '12px' }}>
              Theme: Agriculture, FoodTech & Rural Development
            </p>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              Empowering 24 Districts across Jharkhand from Ranchi to Khunti.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12.5px',
          color: '#94A3B8'
        }}>
          <div>
            © 2026 SamadhanSetu. Built for Smart India Hackathon. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>People. Ideas. Impact.</span>
            <span>•</span>
            <span style={{ color: '#22C55E' }}>Together for a Better Tomorrow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
