import React, { useState, useEffect } from 'react';
import { getPlatformStats, getImpactStories } from '../services/api';
import { HeartHandshake, Award, Users, CheckCircle, ArrowRight, Sparkles, RefreshCw, Layers, MapPin, Building, GraduationCap } from 'lucide-react';

export default function ImpactPage({ setActiveScreen }) {
  const [stats, setStats] = useState({
    projectsInProgress: '0',
    solutionsDeployed: '0',
    peopleBenefited: '0',
    statesCovered: '0'
  });
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadImpactData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live platform counters
      const statData = await getPlatformStats();
      if (statData) {
        setStats({
          projectsInProgress: statData.projectsInProgress || statData.projectsCount || '0',
          solutionsDeployed: statData.solutionsDeployed || '0',
          peopleBenefited: statData.peopleBenefited || '0',
          statesCovered: statData.statesCovered || '0'
        });
      }

      // 2. Fetch live workspace stories
      const storiesList = await getImpactStories();
      if (Array.isArray(storiesList)) {
        setStories(storiesList);
      }
    } catch (err) {
      console.warn('Could not load live impact telemetry:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImpactData();
  }, []);

  return (
    <div style={{ padding: '48px 0 72px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              <Sparkles size={14} />
              Live Field Telemetry & Outcomes
            </div>
            <button
              onClick={loadImpactData}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title="Refresh live telemetry"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
            Creating Real Impact
          </h1>
          <p style={{ fontSize: '15.5px', color: '#64748B', maxWidth: '580px', margin: '0 auto' }}>
            From grassroots problems to verified solutions — real-time outcomes from university adoption & field deployments.
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
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0F2C59' }}>{stats.projectsInProgress}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>Projects Completed / Active</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#16A34A' }}>{stats.solutionsDeployed}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>Solutions Deployed</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#2563EB' }}>{stats.peopleBenefited}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>People Benefited</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#EA580C' }}>{stats.statesCovered}</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569', marginTop: '6px' }}>States / Districts Covered</div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2C59' }}>
              Active University Projects & Field Trials
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
            {(!stories || stories.length === 0) ? (
              <div className="card" style={{
                padding: '44px 24px',
                textAlign: 'center',
                gridColumn: '1 / -1',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #CBD5E1'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No Active Field Projects Yet
                </div>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '460px', margin: '0 auto 20px auto' }}>
                  As soon as a university adopts a verified challenge and conducts engineering sprints, live progress telemetry and outcomes will appear here!
                </p>
                <button
                  onClick={() => setActiveScreen('challenges')}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 18px' }}
                >
                  Explore Challenges
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              stories.map((story, i) => (
                <div key={i} className="card" style={{ padding: '28px', borderTop: '4px solid #2563EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#1E40AF',
                      backgroundColor: '#EFF6FF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                    }}>
                      👥 {story.beneficiaries}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
                      Milestone: {story.progress}%
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                    {story.title}
                  </h3>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#DC2626" /> {story.location}
                  </div>
                  <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                    {story.desc}
                  </p>

                  <button
                    onClick={() => setActiveScreen('workspace')}
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '12.5px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    View Project Sprint Board
                    <ArrowRight size={14} />
                  </button>
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
