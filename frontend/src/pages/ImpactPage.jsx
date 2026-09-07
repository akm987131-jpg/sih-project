import React from 'react';
import { platformStats, successStories } from '../data/mockData';
import { HeartHandshake, Award, Users, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ImpactPage({ setActiveScreen }) {
  return (
    <div style={{ padding: '48px 0 72px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Sparkles size={14} />
            Verified Field Telemetry & Outcomes
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
            Creating Real Impact
          </h1>
          <p style={{ fontSize: '15.5px', color: '#64748B', maxWidth: '580px', margin: '0 auto' }}>
            From grassroots problems to verified solutions — together for a better India.
          </p>
        </div>

        {/* 4 Big Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '20px',
          marginBottom: '48px'
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F2C59' }}>{platformStats.projectsInProgress}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>Projects Completed / Active</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#16A34A' }}>{platformStats.solutionsDeployed}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>Solutions Deployed</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#2563EB' }}>{platformStats.peopleBenefited}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>People Benefited</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#EA580C' }}>{platformStats.statesCovered}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>States / Districts Covered</div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2C59' }}>
              Success Stories from the Field
            </h2>
            <span style={{ fontSize: '13px', color: '#1E3A8A', fontWeight: 600 }}>
              Jharkhand Pilot Deployments
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {(!successStories || successStories.length === 0) ? (
              <div className="card" style={{
                padding: '44px 24px',
                textAlign: 'center',
                gridColumn: '1 / -1',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #CBD5E1'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No Published Field Deployments Yet
                </div>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '460px', margin: '0 auto' }}>
                  Verified field impact stories, IoT telemetry readouts, and citizen testimonials will appear here once collaborative solutions are deployed in the districts.
                </p>
              </div>
            ) : (
              successStories.map((story, i) => (
                <div key={i} className="card" style={{ padding: '28px', borderTop: '4px solid #16A34A' }}>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    {story.beneficiaries}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
                    {story.title}
                  </h3>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '10px' }}>
                    {story.location}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
                    {story.desc}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Quotation Banner */}
        <div style={{
          backgroundColor: '#0F2C59',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 32px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, fontStyle: 'italic', maxWidth: '640px', margin: '0 auto 12px auto', lineHeight: 1.4 }}>
            “When people, technology and institutions work together, real change happens.”
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            SamadhanSetu — Digital platform to crowdsource societal challenges and facilitate collaborative problem solving
          </p>
        </div>

      </div>
    </div>
  );
}
