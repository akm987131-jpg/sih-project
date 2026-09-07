import React from 'react';
import { CheckCircle2, ArrowRight, Layers, MapPin, Tag, AlertOctagon, Bell, Eye } from 'lucide-react';

export default function AiResultPage({ setActiveScreen, latestReport }) {
  return (
    <div style={{ padding: '48px 0 64px 0', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 150px)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Top Success Banner */}
        <div style={{
          backgroundColor: '#DCFCE7',
          border: '1px solid #86EFAC',
          borderRadius: '16px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <CheckCircle2 size={24} color="#16A34A" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
              Analysis Complete
            </h3>
            <p style={{ fontSize: '13px', color: '#15803D' }}>
              Your problem has been analyzed and automatically grouped with similar regional issues.
            </p>
          </div>
        </div>

        {/* 2-Column Result Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}>
          {/* Left Card: AI Analysis Output */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59' }}>
                AI Analysis Result
              </h3>
              <span className={`badge ${
                (latestReport?.aiResult?.priority || 'High').toLowerCase() === 'high' 
                  ? 'badge-high' 
                  : (latestReport?.aiResult?.priority || 'High').toLowerCase() === 'medium'
                  ? 'badge-medium'
                  : 'badge-low'
              }`}>
                {latestReport?.aiResult?.priority || 'High'} Priority
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Identified Problem</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F2C59', marginTop: '2px' }}>
                  {latestReport?.aiResult?.identifiedProblem || 'Unsafe Drinking Water & Groundwater Contamination'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Domain</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#1E3A8A', marginTop: '2px' }}>
                  <Tag size={15} />
                  {latestReport?.aiResult?.domain || 'Water & Sanitation'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Location (GIS Resolved)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#334155', marginTop: '2px' }}>
                  <MapPin size={15} color="#DC2626" />
                  {latestReport?.aiResult?.location || latestReport?.locationName || 'Ranchi, Jharkhand'}
                </div>
              </div>

              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Layers size={20} color="#2563EB" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E3A8A' }}>
                    {latestReport?.aiResult?.similarReportsFound || 7} Related Reports In Cluster
                  </div>
                  <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                    {latestReport?.aiResult?.isGroupedWithCluster 
                      ? 'Consolidated with existing Master Challenge'
                      : 'New Master Challenge Cluster Initialized'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#64748B',
              lineHeight: 1.5
            }}>
              💡 <strong>AI Deduplication Note:</strong> Our FAISS vector clustering & MongoDB 2dsphere spatial engine detected nearby complaints within the district. Combining reports increases priority score to <strong>{latestReport?.aiResult?.priorityScore || '8.6'}/10</strong> for prompt government and university mobilization.
            </div>
          </div>

          {/* Right Card: Next Steps */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '20px' }}>
                Next Steps
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>View Consolidated Challenge</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748B' }}>See the full community problem statement and affected coordinates.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>Track University Progress</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748B' }}>Follow when NIT Jamshedpur or BIT Mesra accepts this problem.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>Get SMS Resolution Alerts</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748B' }}>Receive live notification once a pilot filtration unit is deployed.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => setActiveScreen('challenges')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                View Challenge in Explorer
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setActiveScreen('government')}
                className="btn btn-outline"
                style={{ width: '100%', padding: '12px', fontSize: '13px' }}
              >
                Inspect District Collector Map
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
