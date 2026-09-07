import React from 'react';
import { CheckCircle2, Award, Users, Shield, Cpu, HeartHandshake, Building, Landmark } from 'lucide-react';

export default function AboutPage({ setActiveScreen }) {
  const pillars = [
    { title: 'Empower Citizens to Voice Real Problems', desc: 'Inclusive multimodal reporting through WhatsApp, toll-free voice notes, and Pragya Kendras (CSCs).' },
    { title: 'Use AI to Understand and Group Challenges', desc: 'Vector similarity (FAISS) clusters identical complaints across panchayats into single high-leverage challenges.' },
    { title: 'Enable Universities to Innovate', desc: 'Students and professors tackle verified state crises, earning formal NEP 2020 community credits.' },
    { title: 'Connect Industry for Support', desc: 'Corporate CSR foundations provide agile micro-grants and technical mentoring under Section 135.' },
    { title: 'Help Government Track Progress', desc: 'District Collectors get real-time GIS heatmaps to sanction site permits and trial waivers with one click.' },
    { title: 'Create Measurable Impact', desc: 'Closed-loop telemetry, before/after audits, and direct citizen SMS updates verify solutions on the ground.' }
  ];

  return (
    <div style={{ padding: '48px 0 72px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            Smart India Hackathon 2026 • Problem Statement ID 26043
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F2C59', marginBottom: '12px' }}>
            About SamadhanSetu
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            A collaborative crowdsourcing platform for a stronger, smarter and more inclusive India, bridging societal pain points with collegiate innovation.
          </p>
        </div>

        {/* Mission Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '40px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
          <img 
            src="/assets/logo.png" 
            alt="SamadhanSetu" 
            style={{ width: '130px', height: '130px', objectFit: 'contain', margin: '0 auto 16px auto' }} 
          />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2C59', marginBottom: '10px' }}>
            From "Problem" to "Solution"
          </h2>
          <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
            SamadhanSetu bridges the gap between societal problems and real-world solutions by bringing together citizens, AI, universities, industry, and government on a unified action plane.
          </p>
        </div>

        {/* 6 Value Pillars */}
        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2C59', marginBottom: '20px', textAlign: 'center' }}>
            Core Pillars of Innovation
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {pillars.map((p, i) => (
              <div key={i} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <CheckCircle2 size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F2C59', marginBottom: '6px' }}>
                      {p.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nodal Alignment Banner */}
        <div style={{
          backgroundColor: '#0F2C59',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
            People. Ideas. Impact.
          </h3>
          <p style={{ fontSize: '14px', color: '#22C55E', fontWeight: 700, marginBottom: '12px' }}>
            Together for a Better Tomorrow
          </p>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', maxWidth: '520px', margin: '0 auto 20px auto' }}>
            Proudly developed for the Government of Jharkhand under the theme Agriculture, FoodTech & Rural Development.
          </p>
          <button 
            onClick={() => setActiveScreen('home')}
            className="btn btn-primary"
            style={{ backgroundColor: '#16A34A', color: '#FFFFFF', padding: '10px 24px' }}
          >
            Back to Home Page
          </button>
        </div>

      </div>
    </div>
  );
}
