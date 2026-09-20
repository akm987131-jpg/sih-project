import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Compass, FolderKanban, Users, GraduationCap, Library, MessageSquare, ArrowRight, CheckCircle2, Award, Sparkles, RotateCcw } from 'lucide-react';
import { getChallenges, getWorkspaces, createWorkspace, resetAllData, universityApplyToChallenge } from '../services/api';

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

      const wsList = await getWorkspaces();
      setOngoingProjects(wsList || []);
    } catch (err) {
      console.warn('Using local university state');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUniversityData();
  }, []);

  // Helper: check if a challenge is eligible for university adoption

  // Rule: University can take project if Government Sanctioned it OR Government Approved it AND Industry Funded it
  const isEligibleForUniversity = (c) => {
    if (c.status === 'Sanctioned') return true;
    if (c.status === 'Approved' && (c.isIndustryFunded || (c.fundingSources && c.fundingSources.length > 0))) return true;
    return false;
  };

  // Helper: check if challenge is approved by government but waiting for industry sponsor
  const isAwaitingIndustryFunding = (c) => {
    return c.status === 'Approved' && !c.isIndustryFunded && (!c.fundingSources || c.fundingSources.length === 0);
  };

  const handleAcceptChallenge = async (challenge) => {
    try {
      // Step 1: Register this university as taking up the challenge (updates status to University Matched)
      await universityApplyToChallenge(challenge._id || challenge.id, 'NIT Jamshedpur');

      // Step 2: Create a project workspace for tracking development
      await createWorkspace({
        title: challenge.title,
        domain: challenge.domain,
        location: `${challenge.district || 'Ranchi'}, Jharkhand`,
        leadInstitution: 'NIT Jamshedpur (4 NEP 2020 Credits Assigned)'
      });

      const qualification = challenge.status === 'Sanctioned'
        ? 'Government Sanction'
        : `Government Approval + Industry Grant (${challenge.industrySponsor || 'CSR'})`;

      setAcceptedNotice(`Challenge "${challenge.title}" accepted! Qualified via: ${qualification}. Status updated to University Matched.`);
      await loadUniversityData();
      setTimeout(() => {
        setActiveScreen('workspace');
      }, 1200);
    } catch (err) {
      console.warn('Apply error:', err);
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
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2C59' }}>
                  Available Challenges Open for Universities ({challenges.filter(isEligibleForUniversity).length})
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B' }}>
                  Universities can take up projects that are officially <strong>Government Sanctioned</strong> OR <strong>Government Approved with Industry Funding</strong>.
                </p>
              </div>
            </div>

            {challenges.filter(isEligibleForUniversity).length === 0 ? (
              <div className="card" style={{ padding: '40px 24px', textAlign: 'center', marginBottom: '32px' }}>
                <Compass size={32} color="#1E3A8A" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No Eligible Challenges Available Right Now
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '480px', margin: '0 auto 16px auto' }}>
                  Challenges become available here when either: (1) Government officially Sanctions them, or (2) Government Approves them and Industry provides CSR grant funding.
                </p>
              </div>
            ) : (

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '36px'
              }}>
              {challenges.filter(isEligibleForUniversity).map((ch) => {
                const isSanctioned = ch.status === 'Sanctioned';
                return (
                  <div key={ch._id || ch.id} className="card" style={{ padding: '22px', borderTop: isSanctioned ? '4px solid #0D9488' : '4px solid #7C3AED' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="badge badge-low" style={{ backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>
                        {ch.domain}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {isSanctioned ? (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0D9488', backgroundColor: '#F0FDFA', padding: '2px 8px', borderRadius: '4px', border: '1px solid #99F6E4' }}>
                            🏛 Government Sanctioned
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px', border: '1px solid #DDD6FE' }}>
                            🤝 Approved + Industry Funded
                          </span>
                        )}
                        <span className={`badge badge-${(ch.priority || 'Medium').toLowerCase()}`}>
                          {ch.priority} Priority
                        </span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
                      {ch.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
                      {ch.description}
                    </p>

                    {/* Funding / Sponsor Tag */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      color: '#475569',
                      marginBottom: '14px'
                    }}>
                      {isSanctioned ? (
                        <div><strong>Funding:</strong> Government Sanctioned Research & Innovation Grant</div>
                      ) : (
                        <div><strong>Industry Sponsor:</strong> {ch.industrySponsor || (ch.fundingSources && ch.fundingSources[0]) || 'Tata Projects CSR'} ({ch.industryFundingAmount || '₹14,50,000'})</div>
                      )}
                      <div style={{ marginTop: '4px', color: '#64748B' }}>
                        <strong>Suggested Expertise:</strong> {ch.suggestedExpertise || 'Mechanical & Electrical Engineering'}
                      </div>
                    </div>

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
                );
              })}
              </div>
            )}

            {/* Section: Challenges Approved by Govt but Awaiting Industry Funding */}
            {challenges.filter(isAwaitingIndustryFunding).length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F2C59' }}>
                    Government-Approved Challenges Awaiting Industry Funding ({challenges.filter(isAwaitingIndustryFunding).length})
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '4px' }}>
                    CSR Pending
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '14px' }}>
                  These challenges have been verified and approved by Government Officers as authentic problems. They are currently listed in the Industry CSR Portal. Once an industry partner pledges funding, they will unlock here for university student teams.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {challenges.filter(isAwaitingIndustryFunding).map((ch) => (
                    <div key={ch._id || ch.id} className="card" style={{ padding: '18px', backgroundColor: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                          {ch.domain}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                          ✓ Government Approved
                        </span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                        {ch.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', lineHeight: 1.4 }}>
                        {ch.description}
                      </p>
                      <div style={{ fontSize: '11.5px', color: '#D97706', fontWeight: 600 }}>
                        ⏳ Waiting for Industry CSR Partner to pledge grant before University can adopt.
                      </div>
                    </div>
                  ))}
                </div>
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
