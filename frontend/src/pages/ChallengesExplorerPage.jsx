import React, { useState, useEffect } from 'react';
import { sampleChallenges } from '../data/mockData';
import { getChallenges, seedChallenges, resetAllData } from '../services/api';
import { Search, Filter, MapPin, Tag, ArrowRight, Layers, SlidersHorizontal, RefreshCw, Sparkles } from 'lucide-react';

export default function ChallengesExplorerPage({ setActiveScreen }) {
  const [challenges, setChallenges] = useState(sampleChallenges);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getChallenges();
        if (isMounted && data && data.length > 0) {
          const normalized = data.map(c => ({
            id: c._id || c.id,
            title: c.title,
            description: c.description,
            domain: c.domain,
            priority: c.priority,
            location: c.district ? `${c.district}, Jharkhand` : (c.location || 'Jharkhand'),
            reportsCount: c.reportCount || c.reportsCount || 1,
            suggestedExpertise: c.suggestedExpertise || 'Interdisciplinary Engineering',
          }));
          setChallenges(normalized);
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
      if (data) {
        const normalized = data.map(c => ({
          id: c._id || c.id,
          title: c.title,
          description: c.description,
          domain: c.domain,
          priority: c.priority,
          location: c.district ? `${c.district}, Jharkhand` : (c.location || 'Jharkhand'),
          reportsCount: c.reportCount || c.reportsCount || 1,
          suggestedExpertise: c.suggestedExpertise || 'Interdisciplinary Engineering',
        }));
        setChallenges(normalized);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    await seedChallenges();
    await refreshChallenges();
  };

  const filteredChallenges = challenges.filter((ch) => {
    const matchesSearch = (ch.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ch.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ch.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ch.priority === priorityFilter;
    const matchesDomain = domainFilter === 'All' || ch.domain === domainFilter;
    return matchesSearch && matchesPriority && matchesDomain;
  });

  return (
    <div style={{ padding: '40px 0 60px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
            Challenges Explorer
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748B' }}>
            Explore real crowdsourced societal challenges from across Jharkhand ready for university and industry solving.
          </p>
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
              <option value="All">All Domains</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Agriculture">Agriculture</option>
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
                  Report the First Problem
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleSeed}
                  className="btn btn-outline"
                  style={{ padding: '12px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#1E3A8A' }}
                >
                  <Sparkles size={16} />
                  ⚡ Seed Live Challenges
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
                padding: '24px'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className={`badge badge-${ch.priority.toLowerCase()}`}>
                    {ch.priority} Priority
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E3A8A', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px' }}>
                    {ch.domain}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> {ch.reportsCount} related reports
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>
                  {ch.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
                  {ch.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#DC2626" /> {ch.location}
                  </span>
                  <span>•</span>
                  <span>Suggested: {ch.suggestedExpertise}</span>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => setActiveScreen('workspace')}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '13.5px', whiteSpace: 'nowrap' }}
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
