import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Handshake, HeartHandshake, Award, MessageSquare, CheckCircle2, DollarSign, Building, Sparkles } from 'lucide-react';
import { getChallenges, seedChallenges } from '../services/api';

export default function IndustryDashboardPage({ setActiveScreen }) {
  const [activeTab, setActiveTab] = useState('Opportunities');
  const [pledgedProject, setPledgedProject] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [sponsoredList, setSponsoredList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      const chalRes = await getChallenges();
      if (chalRes && chalRes.length > 0) {
        const opps = chalRes.map((c, idx) => ({
          id: c._id || idx + 1,
          title: c.title,
          domain: c.domain || 'Technology',
          university: 'NIT Jamshedpur Innovation Lab',
          location: `${c.district || 'Ranchi'}, Jharkhand`,
          fundingGoal: idx === 0 ? '₹15,00,000' : idx === 1 ? '₹8,50,000' : '₹12,00,000',
          need: `Micro-grant for prototype components, IoT hardware telemetry, and district field trial logistics.`
        }));
        setOpportunities(opps);
      } else {
        setOpportunities([]);
      }
    } catch (err) {
      console.warn('Using local industry state');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleSeed = async () => {
    setIsLoading(true);
    await seedChallenges();
    await loadOpportunities();
    setPledgedProject({ title: 'Sample CSR Pipeline', goal: 'Ready' });
  };

  const handlePledge = (title, goal) => {
    setPledgedProject({ title, goal });
    setSponsoredList(prev => [...prev, { title, goal, date: new Date().toLocaleDateString() }]);
  };

  const sidebarLinks = [
    { id: 'Opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'Dashboard', label: 'CSR Dashboard', icon: LayoutDashboard },
    { id: 'My Participation', label: 'Sponsored Projects', icon: Handshake },
    { id: 'Funding', label: 'CSR Budget Allocation', icon: HeartHandshake },
    { id: 'Mentorship', label: 'Technical Mentorship', icon: Award },
    { id: 'Messages', label: 'Nodal Messages', icon: MessageSquare }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 150px)', backgroundColor: '#F8FAFC' }}>
      
      {/* Sidebar */}
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
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Corporate CSR Portal
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59' }}>
            Tata Projects CSR
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
                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                color: isActive ? '#7C3AED' : '#475569',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} color={isActive ? '#7C3AED' : '#64748B'} />
              {item.label}
            </button>
          );
        })}

        {/* CSR Budget Allocation Badge */}
        <div style={{
          marginTop: 'auto',
          backgroundColor: '#FAF5FF',
          border: '1px solid #E9D5FF',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center'
        }}>
          <Building size={20} color="#7C3AED" style={{ margin: '0 auto 6px auto' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B21A8' }}>Annual CSR Pool</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#581C87', marginTop: '2px' }}>₹75,00,000</div>
          <div style={{ fontSize: '11px', color: '#7E22CE', marginTop: '2px' }}>Jharkhand Rural Tech Focus</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 36px' }}>
        
        {/* Top Control Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2C59', marginBottom: '4px' }}>
              {activeTab}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Fund and mentor engineering prototypes solving verified community challenges in Jharkhand.
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
                backgroundColor: '#7C3AED',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={15} />
              ⚡ Demo: Add Sample Opportunities
            </button>
          </div>
        </div>

        {pledgedProject && (
          <div style={{
            backgroundColor: '#F5F3FF',
            border: '1px solid #DDD6FE',
            color: '#6D28D9',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13.5px',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#7C3AED" />
              <span>
                CSR Grant Pledge of <strong>{pledgedProject.goal}</strong> recorded for "{pledgedProject.title}".
              </span>
            </div>
            <button 
              onClick={() => setActiveScreen('workspace')}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px', backgroundColor: '#7C3AED' }}
            >
              Open Project Workspace
            </button>
          </div>
        )}

        {/* TAB 1: OPPORTUNITIES */}
        {activeTab === 'Opportunities' && (
          <div>
            {opportunities.length === 0 ? (
              <div className="card" style={{ padding: '50px 32px', textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#7C3AED' }}>
                  <Briefcase size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No CSR Sponsorship Opportunities Listed Yet
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                  Click below to populate live challenges with university teams seeking industry co-sponsorship.
                </p>
                <button onClick={handleSeed} className="btn btn-primary" style={{ fontSize: '13px', backgroundColor: '#7C3AED' }}>
                  ⚡ Seed Sample Opportunities
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}>
                {opportunities.map((opp) => (
                  <div key={opp.id} className="card" style={{ padding: '26px', borderTop: '4px solid #7C3AED' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '3px 10px', borderRadius: '4px' }}>
                        {opp.domain}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F2C59' }}>
                        Grant: {opp.fundingGoal}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                      {opp.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
                      Led by <strong>{opp.university}</strong> • Location: {opp.location}
                    </p>

                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '12.5px',
                      color: '#475569',
                      marginBottom: '18px'
                    }}>
                      <strong>Support Needed:</strong> {opp.need}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setActiveScreen('challenges')}
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '9px', fontSize: '12.5px' }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handlePledge(opp.title, opp.fundingGoal)}
                        className="btn btn-primary" 
                        style={{ flex: 1, padding: '9px', fontSize: '12.5px', backgroundColor: '#7C3AED' }}
                      >
                        Pledge Grant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CSR DASHBOARD (Summary) */}
        {activeTab === 'Dashboard' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Corporate CSR Impact Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#7C3AED' }}>₹35.5 Lakh</div>
                <div style={{ fontSize: '13px', color: '#6B21A8', fontWeight: 700, marginTop: '4px' }}>Grants Disbursed</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A' }}>4 Pilots</div>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: 700, marginTop: '4px' }}>Under Field Trial</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB' }}>18 Engineers</div>
                <div style={{ fontSize: '13px', color: '#1E3A8A', fontWeight: 700, marginTop: '4px' }}>Active Student Mentors</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPONSORED PROJECTS */}
        {activeTab === 'My Participation' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Your Active CSR Project Grants
            </h3>
            {sponsoredList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>No Active Project Pledges Yet</p>
                <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Click "Pledge Grant" on any opportunity to sponsor a university prototype.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sponsoredList.map((item, idx) => (
                  <div key={idx} style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#581C87' }}>{item.title}</div>
                      <div style={{ fontSize: '12.5px', color: '#6B21A8', marginTop: '2px' }}>Grant Pledged: {item.goal} • Date: {item.date}</div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#EDE9FE', padding: '4px 10px', borderRadius: '9999px' }}>
                      ✓ CSR Sanctioned
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FUNDING */}
        {activeTab === 'Funding' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Corporate CSR Budget & MCA Compliance
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              All grants disbursed through SamadhanSetu comply with Section 135 of the Companies Act, Schedule VII (Rural Development & Technology Incubators).
            </p>
          </div>
        )}

        {/* TAB 5: MENTORSHIP */}
        {activeTab === 'Mentorship' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Industry Technical Mentorship Desk
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Tata Projects senior mechanical and water processing engineers conduct bi-weekly sprint reviews with student prototype teams.
            </p>
          </div>
        )}

        {/* TAB 6: MESSAGES */}
        {activeTab === 'Messages' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>
              Nodal Dispatches & University Inbox
            </h3>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>NIT Jamshedpur Rural Tech Team</div>
              <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>
                "Phase 1 arsenic spectrometry report completed. We invite your CSR technical mentor for the bench test review next Monday."
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
