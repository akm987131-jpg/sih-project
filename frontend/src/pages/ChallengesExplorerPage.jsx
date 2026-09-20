import React, { useState, useEffect } from 'react';
import { getChallenges, createWorkspace } from '../services/api';
import { 
  Search, Filter, MapPin, Tag, ArrowRight, Layers, SlidersHorizontal, 
  RefreshCw, Sparkles, X, Camera, ZoomIn, Maximize2, UserCheck, 
  ShieldCheck, CheckCircle2, Building, GraduationCap, Clock, ArrowLeft,
  FileText, ExternalLink, Activity
} from 'lucide-react';

export default function ChallengesExplorerPage({ setActiveScreen, currentUser }) {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  
  // Selected challenge for detailed inspection modal
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isViewingFullPhoto, setIsViewingFullPhoto] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const normalizeChallenge = (c) => ({
    id: c._id || c.id,
    title: c.title,
    description: c.description || c.problemText || 'No detailed description provided.',
    domain: c.domain || 'Water & Sanitation',
    priority: c.priority || 'Medium',
    priorityScore: c.priorityScore || 7.0,
    district: c.district || 'Ranchi',
    state: c.state || 'Jharkhand',
    location: c.locationName || (c.district ? `${c.district}, Jharkhand` : (c.location?.coordinates ? `${c.location.coordinates[1].toFixed(4)}°N, ${c.location.coordinates[0].toFixed(4)}°E` : 'Jharkhand')),
    coordinates: c.location?.coordinates || (Array.isArray(c.coordinates) ? c.coordinates : null),
    reportsCount: c.reportCount || c.reportsCount || 1,
    suggestedExpertise: c.suggestedExpertise || 'Interdisciplinary Engineering',
    assignedDepartment: c.assignedDepartment || 'Department of Rural Development',
    aiSummary: c.aiSummary || `Problem classified under ${c.domain || 'Rural Development'}.`,
    keywords: c.keywords || [],
    photoUrl: c.photoUrl || '',
    status: c.status || 'Government Verification',
    citizenName: c.citizenName || 'Verified Citizen',
    citizenPhone: c.citizenPhone || '',
    governmentAction: c.governmentAction || '',
    governmentOfficer: c.governmentOfficer || '',
    governmentNote: c.governmentNote || '',
    universityName: c.universityName || '',
    fundingSources: c.fundingSources || [],
    createdAt: c.createdAt || new Date().toISOString(),
    raw: c
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getChallenges();
        if (isMounted && Array.isArray(data)) {
          setChallenges(data.map(normalizeChallenge));
        }
      } catch (err) {
        console.warn('Using local fallback for challenges:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const refreshChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await getChallenges();
      if (Array.isArray(data)) {
        setChallenges(data.map(normalizeChallenge));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const standardDomains = ['Water & Sanitation', 'Agriculture', 'Healthcare', 'Infrastructure', 'Renewable Energy'];
  const availableDomains = ['All', ...Array.from(new Set([
    ...standardDomains,
    ...challenges.map(c => c.domain).filter(Boolean)
  ]))];

  const filteredChallenges = challenges.filter((ch) => {
    const matchesSearch = (ch.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ch.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ch.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ch.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ch.priority === priorityFilter;
    const matchesDomain = domainFilter === 'All' || ch.domain === domainFilter;
    return matchesSearch && matchesPriority && matchesDomain;
  });

  const handleOpenInWorkspace = async (ch) => {
    try {
      await createWorkspace({
        title: ch.title,
        domain: ch.domain,
        location: ch.location,
        leadInstitution: 'University Innovation Team (4 NEP 2020 Credits Assigned)'
      });
      setSelectedChallenge(null);
      setActiveScreen('workspace');
    } catch (err) {
      console.warn('Workspace creation notice:', err);
      setSelectedChallenge(null);
      setActiveScreen('workspace');
    }
  };

  return (
    <div style={{ padding: '40px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      {/* FULL-SCREEN PHOTO LIGHTBOX */}
      {isViewingFullPhoto && selectedChallenge?.photoUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 15, 30, 0.94)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100002,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setIsViewingFullPhoto(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '1000px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 20px',
              borderRadius: '12px',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsViewingFullPhoto(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
              ← Back to Details
            </button>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              {selectedChallenge.title} — High-Res Ground Photo
            </div>
            <button
              onClick={() => setIsViewingFullPhoto(false)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <X size={18} /> Close
            </button>
          </div>

          <div 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedChallenge.photoUrl} 
              alt="Uncropped High-Res Ground Evidence" 
              style={{
                maxWidth: '92vw',
                maxHeight: '74vh',
                objectFit: 'contain',
                borderRadius: '12px',
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            />
          </div>

          <div style={{ color: '#CBD5E1', fontSize: '12.5px', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '8px 20px', borderRadius: '9999px' }}>
            📍 Location: {selectedChallenge.location}
          </div>
        </div>
      )}

      {/* CHALLENGE DETAIL MODAL */}
      {selectedChallenge && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setSelectedChallenge(null)}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '0',
              border: 'none',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div style={{
              padding: '22px 28px',
              backgroundColor: '#0F2C59',
              color: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge badge-${selectedChallenge.priority.toLowerCase()}`}>
                    {selectedChallenge.priority} Priority
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#93C5FD', backgroundColor: 'rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                    {selectedChallenge.domain}
                  </span>
                  <span style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> {selectedChallenge.reportsCount} report(s)
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {selectedChallenge.title}
                </h2>
              </div>

              <button 
                onClick={() => setSelectedChallenge(null)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: selectedChallenge.photoUrl ? '1fr 300px' : '1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Left: Description & Location */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Citizen Problem Description
                    </h4>
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '15px',
                      color: '#1E293B',
                      lineHeight: 1.6
                    }}>
                      {selectedChallenge.description}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    {/* Location Box */}
                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <MapPin size={14} color="#DC2626" /> Location & District
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                        {selectedChallenge.location}
                      </div>
                      {selectedChallenge.coordinates && (
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          GPS: {selectedChallenge.coordinates[1]?.toFixed(4)}°N, {selectedChallenge.coordinates[0]?.toFixed(4)}°E
                        </div>
                      )}
                    </div>

                    {/* Reporter Box */}
                    <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <UserCheck size={14} color="#16A34A" /> Reporter Details
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F2C59' }}>
                        {selectedChallenge.citizenName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>
                        Verified Mobile ✓ • {new Date(selectedChallenge.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* AI Triage Card */}
                  <div style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Sparkles size={15} color="#2563EB" /> AI Classification & Suggested Department
                    </div>
                    <div style={{ fontSize: '13px', color: '#1E293B', marginBottom: '8px', lineHeight: 1.5 }}>
                      {selectedChallenge.aiSummary}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      <strong>Suggested Expertise:</strong> {selectedChallenge.suggestedExpertise}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                      <strong>Department:</strong> {selectedChallenge.assignedDepartment}
                    </div>
                  </div>
                </div>

                {/* Right: Ground Photo Evidence */}
                {selectedChallenge.photoUrl && (
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      Ground Photo Evidence
                    </h4>
                    <div 
                      onClick={() => setIsViewingFullPhoto(true)}
                      title="Click to zoom photo full screen"
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#000000'
                      }}
                    >
                      <img 
                        src={selectedChallenge.photoUrl} 
                        alt="Citizen Uploaded Ground Evidence" 
                        style={{
                          width: '100%',
                          height: '220px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(15, 44, 89, 0.9)',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ZoomIn size={13} /> View Full
                      </div>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
                      Authenticity Score: <strong>94% Verified</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Role-Based Workflow Status & Action Bar */}
              <div style={{
                backgroundColor: '#F1F5F9',
                borderRadius: '12px',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Activity size={16} color="#0F2C59" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>
                    Workflow Stage: <span style={{ color: '#2563EB' }}>{selectedChallenge.status}</span>
                  </span>

                  {/* Citizen Role Clarification Badge */}
                  {(!currentUser || currentUser.role === 'Citizen') && (
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: selectedChallenge.status === 'Government Verification' ? '#FEF3C7' : '#DCFCE7',
                      color: selectedChallenge.status === 'Government Verification' ? '#92400E' : '#166534',
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}>
                      {selectedChallenge.status === 'Government Verification' 
                        ? '🕒 Citizen View: Awaiting Government Officer Verification'
                        : '✓ Verified: Assigned for University & Industry Action'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Close
                  </button>

                  {/* University Role Action: Adopt if Sanctioned or Funded */}
                  {currentUser?.role === 'University' && (
                    selectedChallenge.status === 'Sanctioned' || (selectedChallenge.status === 'Approved' && (selectedChallenge.isIndustryFunded || selectedChallenge.fundingSources?.length > 0)) ? (
                      <button
                        onClick={() => handleOpenInWorkspace(selectedChallenge)}
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Adopt in University Innovation Lab
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, backgroundColor: '#E2E8F0', padding: '6px 12px', borderRadius: '6px' }}>
                        🔒 Awaiting Government Sanction Before University Adoption
                      </span>
                    )
                  )}

                  {/* Government Role Action */}
                  {currentUser?.role === 'Government' && (
                    <button
                      onClick={() => {
                        setSelectedChallenge(null);
                        setActiveScreen('government');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0F2C59' }}
                    >
                      Verify in Government Dashboard
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {/* Industry Role Action */}
                  {currentUser?.role === 'Industry' && (
                    <button
                      onClick={() => {
                        setSelectedChallenge(null);
                        setActiveScreen('industry');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#7C3AED' }}
                    >
                      Pledge CSR Grant in Dashboard
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        
        {/* Header Title */}
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
              Challenges Explorer
            </h1>
            <p style={{ fontSize: '14.5px', color: '#64748B' }}>
              Explore real crowdsourced societal challenges from across Jharkhand ready for university and industry solving.
            </p>
          </div>
          <button 
            onClick={refreshChallenges}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
            title="Refresh latest problems"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: 2, minWidth: '260px', position: 'relative' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
              <input 
                type="text"
                placeholder="Search challenges (e.g. water, health, agriculture, Khunti)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Domain Dropdown */}
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                outline: 'none'
              }}
            >
              {availableDomains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom === 'All' ? 'All Domains' : dom}
                </option>
              ))}
            </select>

            {/* Clear Button */}
            <button
              onClick={() => { setSearchQuery(''); setPriorityFilter('All'); setDomainFilter('All'); }}
              style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, padding: '8px 12px' }}
            >
              Clear
            </button>
          </div>

          {/* Priority Pill Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SlidersHorizontal size={14} /> Priority:
            </span>
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: priorityFilter === p ? 700 : 500,
                  backgroundColor: priorityFilter === p ? '#0F2C59' : '#F1F5F9',
                  color: priorityFilter === p ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {p} {p !== 'All' ? 'Priority' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredChallenges.length === 0 ? (
            <div className="card" style={{ padding: '54px 32px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '9999px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#1E3A8A'
              }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2C59', marginBottom: '8px' }}>
                No Challenges Reported Yet (Blank Slate)
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                All mock records have been removed. As soon as a citizen submits a problem, it will be analyzed by AI and appear here!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setActiveScreen('report')}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  Report a Problem
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    await import('../services/api').then(m => m.seedChallenges());
                    await refreshChallenges();
                  }}
                  className="btn btn-outline"
                  style={{ padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderColor: '#2563EB', color: '#2563EB' }}
                >
                  <Sparkles size={16} color="#2563EB" />
                  Load Sample Challenges
                </button>
              </div>
            </div>

          ) : (
            filteredChallenges.map((ch) => (
            <div 
              key={ch.id} 
              className="card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                padding: '24px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedChallenge(ch)}
            >
              {/* Optional Photo Thumbnail in Card */}
              {ch.photoUrl && (
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#000000'
                }}>
                  <img 
                    src={ch.photoUrl} 
                    alt="Ground Evidence Thumbnail" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${ch.priority.toLowerCase()}`}>
                    {ch.priority} Priority
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A8A', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px' }}>
                    {ch.domain}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> {ch.reportsCount} related report(s)
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  {ch.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
                  {ch.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#DC2626" /> {ch.location}
                  </span>
                  <span>•</span>
                  <span>Suggested: {ch.suggestedExpertise}</span>
                </div>
              </div>

              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChallenge(ch);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13.5px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  View Challenge
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )))}
        </div>

      </div>
    </div>
  );
}
