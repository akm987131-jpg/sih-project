import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Compass, FolderKanban, Users, GraduationCap, Library, MessageSquare, ArrowRight, CheckCircle2, Award, Sparkles, RotateCcw } from 'lucide-react';
import { getChallenges, createWorkspace, seedChallenges, resetAllData } from '../services/api';

export default function UniversityDashboardPage({ setActiveScreen }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [acceptedNotice, setAcceptedNotice] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUniversityData = async () => {
    try {
      setIsLoading(true);
      const chalRes = await getChallenges();
      setChallenges(chalRes || []);

      const wsRes = await fetch('http://127.0.0.1:5000/api/v1/workspaces');
      const wsJson = await wsRes.json();
      if (wsJson.success && wsJson.data) {
        setOngoingProjects(wsJson.data);
      }
    } catch (err) {
      console.warn('Using local university state');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUniversityData();
  }, []);

  const handleSeed = async () => {
    setIsLoading(true);
    await seedChallenges();
    await loadUniversityData();
    setAcceptedNotice('⚡ Sample community challenges seeded! Academic matchmaking algorithm found high-confidence matches.');
  };

  const handleAcceptChallenge = async (challenge) => {
    try {
      const res = await createWorkspace({
        title: challenge.title,
        domain: challenge.domain,
        location: `${challenge.district || 'Ranchi'}, Jharkhand`,
        leadInstitution: 'NIT Jamshedpur (4 NEP 2020 Credits Assigned)'
      });
      setAcceptedNotice(`Challenge "${challenge.title}" accepted! Project workspace initialized with 4 NEP 2020 Credits.`);
      await loadUniversityData();
      setTimeout(() => {
        setActiveScreen('workspace');
      }, 1200);
    } catch (err) {
      setActiveScreen('workspace');
    }
  };

  const sidebarLinks = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Recommended', label: 'Recommended Challenges', icon: Compass },
    { id: 'My Projects', label: 'Active Projects', icon: FolderKanban },
    { id: 'Faculty', label: 'Faculty Mentors', icon: Users },
    { id: 'Students', label: 'Student Cohorts', icon: GraduationCap },
    { id: 'Resources', label: 'Lab Equipment & CAD', icon: Library },
    { id: 'Messages', label: 'Official Dispatches', icon: MessageSquare }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 150px)', backgroundColor: '#F8FAFC' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{
        width: '250px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ padding: '0 12px 18px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Academic Innovation Portal
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59' }}>
            NIT Jamshedpur
          </div>
        </div>

        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                color: isActive ? '#1E3A8A' : '#475569',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} color={isActive ? '#1E3A8A' : '#64748B'} />
              {item.label}
            </button>
          );
        })}

        {/* NEP 2020 Credit Badge */}
        <div style={{
          marginTop: 'auto',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center'
        }}>
          <Award size={20} color="#16A34A" style={{ margin: '0 auto 6px auto' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>NEP 2020 Credits</div>
          <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>4 Community Project Credits Active</div>
        </div>
      </aside>

      {/* Main University Content Area */}
      <main style={{ flex: 1, padding: '32px 36px' }}>
        
        {/* Welcome Banner */}
        <div style={{
          backgroundColor: '#0F2C59',
          color: '#FFFFFF',
          padding: '24px 32px',
          borderRadius: '16px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              National Innovation Framework (NEP 2020)
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
              Faculty of Engineering & Rural Tech Cell
            </h1>
            <p style={{ fontSize: '13.5px', color: '#CBD5E1', marginTop: '4px' }}>
              Review grassroots problems clustered by AI and deploy engineering solutions with CSR grant backing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSeed}
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                fontSize: '12.5px',
                padding: '8px 16px',
                backgroundColor: '#16A34A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} />
              ⚡ Demo: Add Sample Challenges
            </button>

            <button
              onClick={() => setActiveScreen('report')}
              className="btn btn-outline"
              style={{ fontSize: '12.5px', padding: '8px 14px', color: '#FFFFFF', borderColor: '#475569' }}
            >
              Report New Issue
            </button>
          </div>
        </div>

        {acceptedNotice && (
          <div style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            {acceptedNotice}
          </div>
        )}

        {/* TAB 1: DASHBOARD or RECOMMENDED */}
        {(activeTab === 'Dashboard' || activeTab === 'Recommended') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2C59' }}>
                  Recommended Challenges for Your Department ({challenges.length})
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B' }}>
                  AI Matchmaking based on institutional patents, faculty publications, and lab equipment.
                </p>
              </div>
            </div>

            {challenges.length === 0 ? (
              <div className="card" style={{ padding: '40px 24px', textAlign: 'center', marginBottom: '32px' }}>
                <Compass size={32} color="#1E3A8A" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No Challenges Currently Listed
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                  Click the button below to populate realistic challenges from Jharkhand districts to test student claim and prototype flows.
                </p>
                <button onClick={handleSeed} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                  ⚡ Seed Sample Challenges
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '36px'
              }}>
                {challenges.map((ch) => (
                  <div key={ch._id || ch.id} className="card" style={{ padding: '22px', borderTop: '4px solid #1E3A8A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-low" style={{ backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>
                        {ch.domain}
                      </span>
                      <span className={`badge badge-${(ch.priority || 'Medium').toLowerCase()}`}>
                        {ch.priority} Priority
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
                      {ch.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
                      {ch.description}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                      <strong>Suggested Expertise:</strong> {ch.suggestedExpertise || 'Mechanical & Electrical Engineering'}
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setActiveScreen('challenges')}
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '8px', fontSize: '12.5px' }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleAcceptChallenge(ch)}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '8px', fontSize: '12.5px', backgroundColor: '#16A34A' }}
                      >
                        Accept & Start
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 2: Active Student Projects */}
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
                Active Collaborative Workspaces ({ongoingProjects.length})
              </h2>

              {ongoingProjects.length === 0 ? (
                <div className="card" style={{ padding: '36px 24px', textAlign: 'center' }}>
                  <FolderKanban size={28} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F2C59', marginBottom: '4px' }}>
                    No Active Projects Initiated
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B' }}>
                    Click "Accept & Start" on any recommended challenge above to spin up a collaborative Quad-Helix workspace.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px'
                }}>
                  {ongoingProjects.map((p) => (
                    <div key={p._id || p.id} className="card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                        {p.title}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '12px' }}>
                        Location: {p.location} • Phase: {p.currentPhase || 'Prototype'}
                      </p>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginBottom: '4px' }}>
                        Progress: {p.progressPercentage || 25}%
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px' }}>
                        <div style={{ width: `${p.progressPercentage || 25}%`, height: '100%', backgroundColor: '#16A34A' }} />
                      </div>
                      <button 
                        onClick={() => setActiveScreen('workspace')}
                        className="btn btn-outline" 
                        style={{ width: '100%', padding: '8px', fontSize: '12.5px' }}
                      >
                        Open Workspace →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FACULTY MENTORS */}
        {activeTab === 'Faculty' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Faculty Innovation Leads & Domain Mentors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F2C59' }}>Dr. Anand Mohan Verma</h4>
                <p style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>Water Quality & Arsenic Filtration</p>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px' }}>Dept of Civil & Environmental Engineering • 14 Scopus Publications</p>
              </div>
              <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F2C59' }}>Dr. Priya Swaminathan</h4>
                <p style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700 }}>Solar IoT Telemetry & Embedded Systems</p>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px' }}>Dept of Electronics & Communication • 2 Patents Filed</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT COHORTS */}
        {activeTab === 'Students' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              NEP 2020 Student Innovation Cohort (Credits Ledger)
            </h3>
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                Cohort A — Rural Technology Capstone (32 Final Year Students)
              </div>
              <div style={{ fontSize: '12.5px', color: '#15803D', marginTop: '4px' }}>
                Status: Assigned to Ranchi District Arsenic Remediation Pilot • 4 Course Credits per student.
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LAB RESOURCES */}
        {activeTab === 'Resources' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              State Innovation Lab & Testing Equipment
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>Spectrometry Test Rig</div>
                <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '2px' }}>● Available for field sample assay</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>Industrial SLA 3D Printer</div>
                <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '2px' }}>● Rapid impeller prototyping ready</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: OFFICIAL DISPATCHES */}
        {activeTab === 'Messages' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Inter-Agency Dispatches & Nodal Communications
            </h3>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3A8A' }}>
                From: District Collectorate, Ranchi (DWSD Nodal Desk)
              </div>
              <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                "Official pilot trial permit granted for rural drinking water test bench in Kanke block. Local Jal Sahiyyas instructed to assist students."
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
