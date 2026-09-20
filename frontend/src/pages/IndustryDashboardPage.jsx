import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Handshake, HeartHandshake, Award, MessageSquare, CheckCircle2, DollarSign, Building, Sparkles, ShieldCheck } from 'lucide-react';
import { getChallenges, industryFundChallenge } from '../services/api';

export default function IndustryDashboardPage({ setActiveScreen }) {
  const [activeTab, setActiveTab] = useState('Opportunities');
  const [pledgedProject, setPledgedProject] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [sponsoredList, setSponsoredList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      // Fetch only challenges eligible for industry (government verified & approved)
      const chalRes = await getChallenges({ forIndustry: 'true' });
      if (chalRes && chalRes.length > 0) {
        // Strict Gate: Don't show project to industry until government approved it as real
        const validStatuses = ['Approved', 'Sanctioned', 'University Matched', 'In Development', 'Pilot', 'Deployed'];
        const approvedChallenges = chalRes.filter(c => validStatuses.includes(c.status));

        const opps = approvedChallenges.map((c, idx) => ({
          id: c._id || idx + 1,
          title: c.title,
          domain: c.domain || 'Technology',
          status: c.status,
          district: c.district || 'Ranchi',
          location: `${c.district || 'Ranchi'}, Jharkhand`,
          governmentOfficer: c.governmentOfficer || 'District Collector',
          governmentNote: c.governmentNote || 'Verified authentic grassroots problem by government department.',
          university: c.universityName || (c.status === 'University Matched' ? 'NIT Jamshedpur Innovation Lab' : 'Seeking University Team'),
          fundingGoal: c.industryFundingAmount || (idx === 0 ? '₹14,50,000' : idx === 1 ? '₹12,00,000' : '₹8,50,000'),
          need: c.description || `Micro-grant for prototype components, IoT hardware telemetry, and district field trial logistics.`,
          isIndustryFunded: Boolean(c.isIndustryFunded || (c.fundingSources && c.fundingSources.length > 0)),
          industrySponsor: c.industrySponsor || (c.fundingSources && c.fundingSources.length > 0 ? c.fundingSources[0] : ''),
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


  const handlePledge = async (opp) => {
    try {
      setIsLoading(true);
      const grantAmount = opp.fundingGoal || '₹12,00,000';
      const sponsor = 'Tata Projects CSR';
      
      // Persist to backend database / in-memory store
      await industryFundChallenge(opp.id || opp._id, sponsor, grantAmount);

      setPledgedProject({
        title: opp.title,
        goal: grantAmount,
        sponsor: sponsor,
      });
      setSponsoredList(prev => [
        { title: opp.title, goal: grantAmount, date: new Date().toLocaleDateString(), sponsor },
        ...prev,
      ]);
      await loadOpportunities();
    } catch (err) {
      console.error('Pledge error:', err);
    } finally {
      setIsLoading(false);
    }
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
            {/* Government Verification Gate Notice */}
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#166534'
            }}>
              <ShieldCheck size={20} color="#16A34A" style={{ flexShrink: 0 }} />
              <div>
                <strong>Strict Verification Protocol Active:</strong> Industry CSR partners are only shown challenges that have been verified and approved by Government Officers as authentic problems. Unverified citizen reports remain in the Government Verification Queue.
              </div>
            </div>

            {opportunities.length === 0 ? (
              <div className="card" style={{ padding: '50px 32px', textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#7C3AED' }}>
                  <Briefcase size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  No Government-Approved CSR Opportunities Listed Yet
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px auto' }}>
                  Problems must first be approved by a Government Officer in the Verification Queue before appearing here.
                </p>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '3px 10px', borderRadius: '4px' }}>
                        {opp.domain}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F2C59' }}>
                        Grant: {opp.fundingGoal}
                      </span>
                    </div>

                    {/* Government Verification Trust Badge */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#16A34A',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={13} />
                        ✓ Government Approved (Real & Verified)
                      </span>
                      {opp.isIndustryFunded ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#7C3AED',
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          🤝 CSR Funded ({opp.industrySponsor || 'Tata Projects'})
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#D97706',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          ⏳ Awaiting CSR Sponsor
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                      {opp.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
                      Team: <strong>{opp.university}</strong> • Location: {opp.location}
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
                      <strong>Problem & Scope:</strong> {opp.need}
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
                        onClick={() => handlePledge(opp)}
                        disabled={isLoading}
                        className="btn btn-primary" 
                        style={{
                          flex: 1,
                          padding: '9px',
                          fontSize: '12.5px',
                          backgroundColor: opp.isIndustryFunded ? '#16A34A' : '#7C3AED'
                        }}
                      >
                        {opp.isIndustryFunded ? '✓ Grant Pledged' : `Pledge ${opp.fundingGoal}`}
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
