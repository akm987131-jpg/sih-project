import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map, Layers, FolderCheck, FileBarChart, PieChart, Settings, 
  CheckCircle, ShieldCheck, Sparkles, RotateCcw, ClipboardList, ScrollText, X, 
  MapPin, Camera, User, Phone, FileText, ExternalLink, ChevronLeft, ChevronRight, 
  Maximize2, ArrowLeft, ZoomIn 
} from 'lucide-react';
import { getPlatformStats, getChallenges, getPendingChallenges, performGovernmentAction, resetAllData, getAuditLogs, getDistrictMap } from '../services/api';

// Maps a challenge status to a color for display
function getStatusColor(status) {
  const map = {
    'Submitted': '#64748B', 'AI Analysis': '#7C3AED', 'Duplicate Check': '#D97706',
    'Government Verification': '#2563EB', 'Approved': '#16A34A', 'Dismissed': '#DC2626',
    'Sanctioned': '#0D9488', 'University Matched': '#EA580C',
    'In Development': '#0369A1', 'Pilot': '#7C3AED', 'Deployed': '#15803D',
  };
  return map[status] || '#64748B';
}

/**
 * PhotoLightboxModal — Full uncropped photo viewer with dedicated Back / Close controls
 * and keyboard Esc support so government officers can thoroughly inspect ground evidence.
 */
function PhotoLightboxModal({ photoUrl, title, locationName, coordsStr, reporterName, onClose, onPrevSlide, onNextSlide, slideIndex, totalSlides }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrevSlide) onPrevSlide();
      if (e.key === 'ArrowRight' && onNextSlide) onNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevSlide, onNextSlide]);

  return (
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
        zIndex: 100000,
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      {/* Top Controls & Navigation Bar */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '12px 20px',
          borderRadius: '12px',
          color: '#FFFFFF',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Back Button */}
        <button
          onClick={onClose}
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
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={18} />
          ← Back to Verification
        </button>

        {/* Title & Metadata */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>
            {title || 'Ground Evidence High-Resolution View'}
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '2px' }}>
            <span>📍 {locationName}</span>
            <span>•</span>
            <span>🌐 {coordsStr}</span>
            {reporterName && (
              <>
                <span>•</span>
                <span>👤 {reporterName}</span>
              </>
            )}
          </div>
        </div>

        {/* Close & Slide Index */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {totalSlides > 1 && (
            <span style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px' }}>
              Slide {slideIndex + 1} of {totalSlides}
            </span>
          )}
          <button
            onClick={onClose}
            title="Close Preview (Esc)"
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
      </div>

      {/* Main Image Stage */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1200px',
          flex: 1,
          margin: '16px 0',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Slide Floating Button */}
        {totalSlides > 1 && onPrevSlide && (
          <button
            onClick={onPrevSlide}
            title="Previous Slide"
            style={{
              position: 'absolute',
              left: '12px',
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronLeft size={26} />
          </button>
        )}

        {/* Full Uncropped High-Res Image */}
        <img 
          src={photoUrl} 
          alt="Full Evidence Preview" 
          style={{
            maxWidth: '92vw',
            maxHeight: '74vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        />

        {/* Next Slide Floating Button */}
        {totalSlides > 1 && onNextSlide && (
          <button
            onClick={onNextSlide}
            title="Next Slide"
            style={{
              position: 'absolute',
              right: '12px',
              zIndex: 10,
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
            }}
          >
            <ChevronRight size={26} />
          </button>
        )}
      </div>

      {/* Bottom Bar Info */}
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          color: '#CBD5E1',
          fontSize: '12.5px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          padding: '8px 20px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4ADE80' }}>
          <CheckCircle size={14} /> EXIF Geotag Integrity Verified
        </span>
        <span>•</span>
        <span>Click <strong>← Back to Verification</strong> or press <strong>ESC</strong> to return</span>
      </div>
    </div>
  );
}

/**
 * ActionModal — shown when a government officer clicks "Review & Decide" on a challenge.
 * Displays full photo evidence with zoom/fullscreen, citizen ground descriptions,
 * multi-report slide navigation, exact location & coordinates, and AI triage recommendation.
 */
function ActionModal({ challenge, onConfirm, onCancel }) {
  const [selectedAction, setSelectedAction] = useState('Approve');
  const [note, setNote] = useState('');
  const [officerName, setOfficerName] = useState('District Nodal Officer');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isViewingFullPhoto, setIsViewingFullPhoto] = useState(false);

  const actions = [
    { key: 'Approve', label: '✓ Approve', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
    { key: 'Sanction', label: '🏛 Approve for University Work', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { key: 'RequestInfo', label: '⏳ Request More Info', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
    { key: 'Dismiss', label: '✗ Dismiss', color: '#DC2626', bg: '#FFF1F2', border: '#FCA5A5' },
  ];

  // Derive all reports in this challenge (or single report fallback)
  const rawReports = (challenge.reports && challenge.reports.length > 0) 
    ? challenge.reports 
    : [{
        citizenName: challenge.citizenName || 'Anonymous Citizen',
        citizenPhone: challenge.citizenPhone || '',
        problemText: challenge.description || 'No description provided.',
        photoUrl: challenge.photoUrl || '',
        locationName: challenge.locationName || `${challenge.district || 'Ranchi'}, ${challenge.state || 'Jharkhand'}`,
        timestamp: challenge.createdAt
      }];

  const totalSlides = rawReports.length;
  // Ensure valid slide index
  const safeSlideIndex = Math.min(Math.max(0, currentSlideIndex), totalSlides - 1);
  const activeReport = rawReports[safeSlideIndex] || rawReports[0];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  // Derive coordinates string if available
  const coordsStr = challenge.location?.coordinates 
    ? `${challenge.location.coordinates[1]?.toFixed(4)}° N, ${challenge.location.coordinates[0]?.toFixed(4)}° E`
    : '23.3441° N, 85.3240° E';

  const groundPhoto = activeReport.photoUrl || challenge.photoUrl || '';
  const groundDescription = activeReport.problemText || challenge.description || '';
  const groundLocation = activeReport.locationName || challenge.locationName || `${challenge.district || 'Ranchi'}, ${challenge.state || 'Jharkhand'}`;
  const reporterName = activeReport.citizenName || challenge.citizenName || 'Anonymous Citizen';
  const reporterPhone = activeReport.citizenPhone || challenge.citizenPhone || '';

  return (
    <>
      {/* Lightbox Full Photo Modal */}
      {isViewingFullPhoto && groundPhoto && (
        <PhotoLightboxModal
          photoUrl={groundPhoto}
          title={challenge.title}
          locationName={groundLocation}
          coordsStr={coordsStr}
          reporterName={reporterName}
          onClose={() => setIsViewingFullPhoto(false)}
          onPrevSlide={totalSlides > 1 ? handlePrevSlide : null}
          onNextSlide={totalSlides > 1 ? handleNextSlide : null}
          slideIndex={safeSlideIndex}
          totalSlides={totalSlides}
        />
      )}

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '28px', width: '720px', maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)' }}>
          
          {/* Modal header with Back / Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={onCancel} 
                title="Go Back"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  background: '#F1F5F9', 
                  border: '1px solid #CBD5E1', 
                  borderRadius: '8px', 
                  padding: '6px 12px', 
                  cursor: 'pointer', 
                  color: '#0F2C59', 
                  fontSize: '13px', 
                  fontWeight: 700 
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#1E3A8A" />
                  <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F2C59', margin: 0 }}>Government Human Verification</h2>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  Verify physical evidence, ground location, and citizen report authenticity before deciding.
                </p>
              </div>
            </div>
            <button onClick={onCancel} style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748B' }}>
              <X size={18} />
            </button>
          </div>

          {/* Challenge Title & Badges */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className={`badge badge-${(challenge.priority || 'Medium').toLowerCase()}`}>{challenge.priority} Priority</span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                {challenge.domain}
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0D9488', backgroundColor: '#F0FDFA', padding: '2px 8px', borderRadius: '4px' }}>
                {totalSlides} Citizen Report{totalSlides > 1 ? 's' : ''} Clustered
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F2C59', margin: 0 }}>{challenge.title}</h3>
          </div>

          {/* Slide Navigation Header (When multiple citizen reports exist) */}
          {totalSlides > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#1E3A8A" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E3A8A' }}>
                  Citizen Report Slide {safeSlideIndex + 1} of {totalSlides}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handlePrevSlide}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #93C5FD',
                    color: '#1E3A8A',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={15} /> Previous Slide
                </button>
                <div style={{ display: 'flex', gap: '4px', margin: '0 4px' }}>
                  {rawReports.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: idx === safeSlideIndex ? '#1E3A8A' : '#CBD5E1',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title={`Go to Report Slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextSlide}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #93C5FD',
                    color: '#1E3A8A',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Next Slide <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* 1. PHOTOGRAPHIC EVIDENCE SECTION (Click to see full uncropped photo) */}
          <div style={{ marginBottom: '18px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={15} color="#1E3A8A" />
                Photo Evidence & Visual Proof
              </div>
              {groundPhoto && (
                <button
                  onClick={() => setIsViewingFullPhoto(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Maximize2 size={13} /> Click to View Full Photo
                </button>
              )}
            </div>

            {groundPhoto ? (
              <div 
                onClick={() => setIsViewingFullPhoto(true)}
                title="Click photo to inspect full uncropped image"
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #CBD5E1',
                  backgroundColor: '#000',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <img 
                  src={groundPhoto} 
                  alt="Citizen Field Evidence" 
                  style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', display: 'block' }} 
                />
                
                {/* Overlay Badges */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(15, 23, 42, 0.88)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={12} color="#4ADE80" /> EXIF Geotag Verified
                </div>

                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(15, 44, 89, 0.9)',
                  color: '#FFFFFF',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  <ZoomIn size={13} /> View Full Photo
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px dashed #CBD5E1', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                No image uploaded by citizen for this report (Text-only problem report).
              </div>
            )}
          </div>

          {/* 2. CITIZEN GROUND DESCRIPTION */}
          <div style={{ marginBottom: '18px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E3A8A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="#1E3A8A" />
              Citizen Problem Description (Ground Reality)
            </div>
            <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              {groundDescription || 'No description provided.'}
            </div>
          </div>

          {/* 3. GROUND LOCATION & GPS DETAILS */}
          <div style={{ marginBottom: '18px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E3A8A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="#1E3A8A" />
              Verified Location & GPS Coordinates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>Ground Location / Landmark:</span>
                <span style={{ fontWeight: 700, color: '#0F2C59' }}>{groundLocation}</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>District & State:</span>
                <span style={{ fontWeight: 700, color: '#0F2C59' }}>{challenge.district || 'Ranchi'}, {challenge.state || 'Jharkhand'}</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>GPS Lat / Long:</span>
                <span style={{ fontWeight: 700, color: '#0F2C59' }}>{coordsStr}</span>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>Reporter:</span>
                <span style={{ fontWeight: 700, color: '#0F2C59' }}>
                  {reporterName} {reporterPhone ? `(+91 ${reporterPhone})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* 4. AI TRIAGE & ANALYSIS SUMMARY */}
          <div style={{ marginBottom: '18px', backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '14px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#2563EB" />
              AI Triage & Classification Summary
            </div>
            <div style={{ fontSize: '12.5px', color: '#1E3A8A', lineHeight: 1.5 }}>
              {challenge.aiSummary || `Classified as ${challenge.domain}. Suggested expertise: ${challenge.suggestedExpertise || 'Domain Specialist'}.`}
            </div>
            {challenge.keywords && challenge.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                {challenge.keywords.map(kw => (
                  <span key={kw} style={{ fontSize: '11px', backgroundColor: '#DBEAFE', color: '#1E3A8A', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

        {/* 5. OFFICER NAME INPUT */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Officer Name (recorded in audit log)
          </label>
          <input
            type="text"
            value={officerName}
            onChange={e => setOfficerName(e.target.value)}
            placeholder="Your name as government officer"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13.5px', boxSizing: 'border-box' }}
          />
        </div>

        {/* 6. ACTION SELECTION */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
            Select Action
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {actions.map(a => (
              <button
                key={a.key}
                onClick={() => setSelectedAction(a.key)}
                style={{ padding: '11px 14px', borderRadius: '8px', border: `2px solid ${selectedAction === a.key ? a.color : a.border}`, backgroundColor: selectedAction === a.key ? a.bg : '#FFFFFF', color: a.color, fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. DECISION NOTE */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Decision Note (optional)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="Add a reason or instruction for this decision..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* 8. CONFIRM / CANCEL */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => selectedAction && officerName.trim() && onConfirm(selectedAction, officerName, note)}
            disabled={!selectedAction || !officerName.trim()}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: selectedAction && officerName.trim() ? '#0F2C59' : '#CBD5E1', color: '#FFFFFF', fontWeight: 700, fontSize: '14px', border: 'none', cursor: selectedAction ? 'pointer' : 'not-allowed' }}
          >
            Confirm Decision
          </button>
          <button onClick={onCancel} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default function GovernmentDashboardPage({ setActiveScreen }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [sanctionNotice, setSanctionNotice] = useState(null);
  const [stats, setStats] = useState({ reportsReceived: '0', verified: '0', projects: '0', deployed: '0' });
  const [districtHotspots, setDistrictHotspots] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [sanctionedList, setSanctionedList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Set to a challenge object to open the decision modal
  const [reviewingChallenge, setReviewingChallenge] = useState(null);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const summary = await getPlatformStats();
      if (summary) {
        setStats({
          reportsReceived: summary.reportsReceived || '0',
          verified: summary.challengesIdentified || '0',
          projects: summary.projectsInProgress || '0',
          deployed: summary.solutionsDeployed || '0',
        });
      }

      const hotspots = await getDistrictMap();
      setDistrictHotspots(hotspots || []);

      const chalList = await getChallenges();
      setChallenges(chalList || []);

      const pending = await getPendingChallenges();
      setPendingChallenges(pending || []);

      const sanctioned = (chalList || []).filter(c =>
        ['Approve', 'Approved', 'Sanctioned', 'University Matched', 'In Development', 'Pilot', 'Deployed'].includes(c.status)
      );
      setSanctionedList(sanctioned);

      const logs = await getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err) {
      console.warn('Some dashboard data unavailable:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  const handleResetData = async () => {
    setIsLoading(true);
    await resetAllData();
    await loadDashboardData();
    setSelectedDistrict(null);
    setSanctionNotice('🗑️ All datasets wiped back to blank slate.');
  };


  // Called when officer confirms their decision in the ActionModal
  const handleGovernmentDecision = async (action, officerName, note) => {
    const challenge = reviewingChallenge;
    setReviewingChallenge(null);

    const challengeId = challenge._id || challenge.id || challenge.raw?._id || challenge.raw?.id;
    const result = await performGovernmentAction(challengeId, action, officerName, note);
    if (result.success) {
      const messages = {
        Approve: `✓ "${challenge.title}" approved.`,
        Dismiss: `✗ "${challenge.title}" dismissed.`,
        Sanction: `🏛 "${challenge.title}" sanctioned! Universities can now apply.`,
        RequestInfo: `⏳ Additional information requested for "${challenge.title}".`,
      };
      setSanctionNotice(messages[action] || 'Decision recorded.');
      await loadDashboardData();
    } else {
      setSanctionNotice('⚠ Could not save decision. Please try again.');
    }
  };

  const sidebarLinks = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Verification', label: 'Review Queue', icon: ClipboardList, badge: pendingChallenges.length },
    { id: 'Map View', label: 'District Map', icon: Map },
    { id: 'Challenges', label: 'All Problems', icon: Layers },
    { id: 'Projects', label: 'Approved Projects', icon: FolderCheck },
    { id: 'Reports', label: 'Citizen Reports', icon: FileBarChart },
    { id: 'AuditLog', label: 'Activity Log', icon: ScrollText },
    { id: 'Analytics', label: 'Impact & Results', icon: PieChart },
    { id: 'Settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 150px)', backgroundColor: '#F8FAFC' }}>

      {/* Decision modal overlay */}
      {reviewingChallenge && (
        <ActionModal
          challenge={reviewingChallenge}
          onConfirm={handleGovernmentDecision}
          onCancel={() => setReviewingChallenge(null)}
        />
      )}

      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
        <div style={{ padding: '0 12px 18px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Government of Jharkhand</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59' }}>District Office</div>
        </div>

        {sidebarLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: isActive ? 700 : 500, backgroundColor: isActive ? '#EFF6FF' : 'transparent', color: isActive ? '#0F2C59' : '#475569', textAlign: 'left', border: 'none', cursor: 'pointer', width: '100%' }}>
              <Icon size={16} color={isActive ? '#0F2C59' : '#64748B'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{item.badge}</span>
              )}
            </button>
          );
        })}

        <div style={{ marginTop: 'auto', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <ShieldCheck size={20} color="#0F2C59" style={{ margin: '0 auto 4px auto' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F2C59' }}>Government Department</div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>Jharkhand State DWSD & RDD</div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>

        {/* Top header row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F2C59', marginBottom: '4px' }}>
              {activeTab === 'Dashboard' ? 'State Overview' : activeTab === 'AuditLog' ? 'Activity Log' : activeTab === 'Verification' ? 'Review Queue' : activeTab === 'Challenges' ? 'All Problems' : activeTab === 'Projects' ? 'Approved Projects' : activeTab === 'Map View' ? 'District Map' : activeTab}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Real-time updates across 24 districts of Jharkhand</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleResetData} disabled={isLoading} className="btn btn-outline" style={{ fontSize: '12.5px', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
              <RotateCcw size={13} /> Reset All Data
            </button>
          </div>

        </div>

        {/* Stats counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Citizen Reports', value: stats.reportsReceived, color: '#0F2C59' },
            { label: 'Needs Review', value: pendingChallenges.length, color: '#2563EB' },
            { label: 'Approved Projects', value: sanctionedList.length, color: '#0D9488' },
            { label: 'Solutions Deployed', value: stats.deployed, color: '#16A34A' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Notice banner */}
        {sanctionNotice && (
          <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '13px' }}>
            <CheckCircle size={16} /> {sanctionNotice}
          </div>
        )}

        {/* ===== VERIFICATION QUEUE TAB ===== */}
        {activeTab === 'Verification' && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59' }}>Challenges Awaiting Government Decision</h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Review AI analysis and citizen reports. Take a decision before any university can act.</p>
            </div>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#9A3412' }}>
              <strong>Human Verification Required:</strong> These challenges have been processed by AI. The AI analysis is a recommendation only. Only an authorized government officer can Approve, Sanction, or Dismiss a challenge.
            </div>

            {pendingChallenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <ClipboardList size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59', marginBottom: '4px' }}>No Challenges Pending Verification</p>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Citizen reports submitted through the portal will appear here after AI triage.</p>
              </div>
            ) : (

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {pendingChallenges.map(ch => {
                  const photo = ch.photoUrl || (ch.reports && ch.reports.length > 0 ? ch.reports[0].photoUrl : '');
                  const loc = ch.locationName || `${ch.district}, ${ch.state || 'Jharkhand'}`;
                  const reporter = ch.citizenName || (ch.reports && ch.reports.length > 0 ? ch.reports[0].citizenName : 'Anonymous Citizen');

                  return (
                    <div key={ch._id} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '20px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Top Header: Badges & Photo Preview */}
                      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                        {photo && (
                          <div style={{ width: '110px', height: '90px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                            <img src={photo} alt="Evidence thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${(ch.priority || 'Medium').toLowerCase()}`}>{ch.priority} Priority</span>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>{ch.domain}</span>
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2563EB', padding: '2px 8px', borderRadius: '4px', border: '1px solid #BFDBFE', backgroundColor: '#F0F9FF' }}>{ch.status}</span>
                            {photo && (
                              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>Photo Evidence Attached ✓</span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59', margin: '0 0 6px 0' }}>{ch.title}</h4>
                          <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>{ch.description}</p>
                        </div>
                      </div>

                      {/* AI analysis panel */}
                      {ch.aiSummary && (
                        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>AI Analysis</div>
                          <p style={{ fontSize: '12.5px', color: '#1E3A8A', margin: 0 }}>{ch.aiSummary}</p>
                          {ch.keywords && ch.keywords.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                              {ch.keywords.map(kw => (
                                <span key={kw} style={{ fontSize: '11px', backgroundColor: '#DBEAFE', color: '#1E3A8A', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{kw}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta info bar */}
                      <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0F2C59', fontWeight: 600 }}>
                          <MapPin size={14} color="#2563EB" /> {loc}
                        </span>
                        <span>👤 Reporter: <strong>{reporter}</strong></span>
                        <span>Citizen Reports: <strong>{ch.reportCount || 1}</strong></span>
                        <span>Expertise: <strong>{ch.suggestedExpertise}</strong></span>
                      </div>

                      <div>
                        <button
                          onClick={() => setReviewingChallenge(ch)}
                          style={{ padding: '10px 22px', borderRadius: '8px', backgroundColor: '#0F2C59', color: '#FFFFFF', fontWeight: 700, fontSize: '13.5px', border: 'none', cursor: 'pointer' }}
                        >
                          Review & Decide
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== DASHBOARD TAB ===== */}
        {activeTab === 'Dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* District Problem Map */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59' }}>24-Districts Problem Map</h3>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', fontWeight: 600 }}>
                  <span style={{ color: '#DC2626' }}>● High</span>
                  <span style={{ color: '#F59E0B' }}>● Medium</span>
                  <span style={{ color: '#16A34A' }}>● Low</span>
                </div>
              </div>
              <div style={{ height: '240px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>State of Jharkhand</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {districtHotspots.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#64748B' }}>No district problem data available</div>
                  ) : (
                    districtHotspots.map(d => (
                      <button
                        key={d.district}
                        onClick={() => setSelectedDistrict(d)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          backgroundColor: selectedDistrict?.district === d.district ? '#0F2C59' : '#FFFFFF',
                          color: selectedDistrict?.district === d.district ? '#FFFFFF' : '#0F2C59',
                          border: `1px solid ${selectedDistrict?.district === d.district ? '#0F2C59' : '#CBD5E1'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: d.priority === 'High' ? '#DC2626' : d.priority === 'Medium' ? '#F59E0B' : '#16A34A' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>{d.district}</span>
                        <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>{d.count}</span>
                      </button>
                    ))
                  )}
                </div>
                {selectedDistrict && (
                  <div style={{ marginTop: '16px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F2C59' }}>{selectedDistrict.district} Problems</span>
                      <span className={`badge badge-${selectedDistrict.priority.toLowerCase()}`}>{selectedDistrict.priority} Priority</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px' }}>Issue: <strong>{selectedDistrict.issue}</strong> ({selectedDistrict.count} reports)</p>
                    <button onClick={() => setActiveTab('Verification')} className="btn btn-primary" style={{ marginTop: '8px', padding: '6px 14px', fontSize: '12px' }}>Review Problems</button>
                  </div>
                )}
              </div>
            </div>

            {/* Top Problems */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F2C59' }}>Top Urgent Problems</h3>
                <button onClick={() => setActiveTab('Challenges')} style={{ fontSize: '12px', color: '#1E3A8A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {challenges.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>No Problems Reported Yet</p>
                  </div>
                ) : (
                  challenges.slice(0, 4).map(ch => (
                    <div key={ch._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>{ch.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {ch.district} • {ch.reportCount} reports • <span style={{ color: getStatusColor(ch.status), fontWeight: 700 }}>{ch.status}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge badge-${(ch.priority || 'Medium').toLowerCase()}`}>{ch.priority}</span>
                        {ch.status === 'Government Verification' ? (
                          <button onClick={() => setReviewingChallenge(ch)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11.5px' }}>Review</button>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                            {ch.status === 'Approved' ? 'Approved ✓' : ch.status === 'Sanctioned' ? 'Sanctioned 🏛️' : ch.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setActiveScreen('challenges')} className="btn btn-outline" style={{ width: '100%', marginTop: '14px', padding: '10px', fontSize: '13px' }}>View All Reported Problems</button>
            </div>
          </div>
        )}

        {/* ===== MAP VIEW TAB ===== */}
        {activeTab === 'Map View' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>Jharkhand State GIS Map</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Geo-referenced citizen clusters and nodal jurisdiction tracking.</p>
            <div style={{ backgroundColor: '#F1F5F9', borderRadius: '14px', padding: '24px', border: '1px solid #CBD5E1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {['Ranchi', 'Dhanbad', 'Hazaribagh', 'East Singhbhum', 'Bokaro', 'Palamu', 'Deoghar', 'Dumka', 'Giridih', 'Ramgarh'].map(dist => {
                  const hotspot = districtHotspots.find(h => h.district === dist);
                  return (
                    <div key={dist} onClick={() => hotspot && setSelectedDistrict(hotspot)} style={{ padding: '14px', borderRadius: '10px', backgroundColor: hotspot ? '#FFFFFF' : '#F8FAFC', border: hotspot ? '2px solid #0F2C59' : '1px solid #E2E8F0', cursor: hotspot ? 'pointer' : 'default' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>{dist}</span>
                        {hotspot ? <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>{hotspot.count} Issues</span> : <span style={{ fontSize: '11px', color: '#16A34A' }}>Nominal</span>}
                      </div>
                      {hotspot && <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>{hotspot.issue}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== ALL CHALLENGES TAB ===== */}
        {activeTab === 'Challenges' && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59' }}>All Challenges ({challenges.length})</h3>
              <button onClick={() => setActiveScreen('report')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Report New Problem</button>
            </div>
            {challenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59', marginBottom: '6px' }}>No challenges listed yet.</p>
                <p style={{ fontSize: '13px', color: '#64748B' }}>Citizen problem submissions will populate here automatically.</p>
              </div>
            ) : (

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {challenges.map(ch => (
                  <div key={ch._id} style={{ padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${(ch.priority || 'Medium').toLowerCase()}`}>{ch.priority} Priority</span>
                          <span style={{ fontSize: '11.5px', color: '#1E3A8A', fontWeight: 700, backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>{ch.domain}</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: getStatusColor(ch.status), padding: '2px 8px', borderRadius: '4px', border: `1px solid ${getStatusColor(ch.status)}40`, backgroundColor: `${getStatusColor(ch.status)}10` }}>{ch.status}</span>
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F2C59' }}>{ch.title}</h4>
                        <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{ch.description}</p>
                        {ch.governmentOfficer && (
                          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Decision by: <strong>{ch.governmentOfficer}</strong>{ch.governmentNote ? ` — "${ch.governmentNote}"` : ''}</p>
                        )}
                      </div>
                      {ch.status === 'Government Verification' && (
                        <button onClick={() => setReviewingChallenge(ch)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}>Review & Decide</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== SANCTIONED PROJECTS TAB ===== */}
        {activeTab === 'Projects' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '6px' }}>Sanctioned Projects</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Challenges officially sanctioned by government — visible to universities for application.</p>
            {sanctionedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59', marginBottom: '4px' }}>No Sanctioned Projects Yet</p>
                <p style={{ fontSize: '12.5px', color: '#64748B' }}>Go to Verification Queue and "Sanction" a challenge to move it here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sanctionedList.map(item => (
                  <div key={item._id} style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>{item.title} — {item.district}</div>
                      <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>{item.domain}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                        By: {item.governmentOfficer || 'Government Officer'}{item.universityName ? ` • University: ${item.universityName}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803D', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>✓ {item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== CITIZEN REPORTS TAB ===== */}
        {activeTab === 'Reports' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>Citizen Incident Reports Stream</h3>
            {challenges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>No Citizen Reports Recorded Yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenges.map((ch, idx) => (
                  <div key={idx} style={{ padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>Report #{idx + 101} • {ch.district}</span>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>AI Confidence: High</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>{ch.description}</p>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Domain: {ch.domain} • Clustered: {ch.reportCount} reports • Status: <strong style={{ color: getStatusColor(ch.status) }}>{ch.status}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== AUDIT LOG TAB ===== */}
        {activeTab === 'AuditLog' && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59' }}>Government Action Audit Log</h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Immutable record of every officer decision — who did what, on which challenge, and when.</p>
            </div>
            {auditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                <ScrollText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F2C59' }}>No Audit Entries Yet</p>
                <p style={{ fontSize: '12.5px' }}>Entries appear here once government officers take decisions on challenges.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auditLogs.map((log, idx) => {
                  const colors = { Approve: '#16A34A', Dismiss: '#DC2626', Sanction: '#0D9488', RequestInfo: '#D97706' };
                  const color = colors[log.action] || '#64748B';
                  return (
                    <div key={log._id || idx} style={{ padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color, backgroundColor: `${color}15`, padding: '2px 10px', borderRadius: '4px', border: `1px solid ${color}30` }}>{log.action}</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2C59' }}>{log.challengeTitle}</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#475569' }}>By: <strong>{log.officerName}</strong></div>
                        {log.note && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Note: {log.note}</div>}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ANALYTICS TAB ===== */}
        {activeTab === 'Analytics' && (
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>State Innovation Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E3A8A' }}>{pendingChallenges.length}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>Awaiting Verification</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#166534' }}>{sanctionedList.length}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>Sanctioned for Development</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED' }}>{auditLogs.length}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>Total Decisions Recorded</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'Settings' && (
          <div className="card" style={{ padding: '28px', maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2C59', marginBottom: '16px' }}>Nodal Authority Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Designated Nodal Department</label>
                <input type="text" readOnly value="Drinking Water & Sanitation Dept (DWSD) - Govt of Jharkhand" style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '13.5px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Crisis Escalation Threshold</label>
                <input type="text" readOnly value="5 Clustered Reports within 10km radius triggers Level 1 Alert" style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '13.5px' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>SMS Notification Service</label>
                <input type="text" readOnly value="Enabled — Automated SMS updates to citizens on milestone completion" style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', fontSize: '13.5px' }} />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}



