import React, { useRef } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import html2canvas from 'html2canvas';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  data: PDFContent;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!pdfRef.current) return;
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'lead-magnet.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .from(pdfRef.current)
      .save();
  };

  const handleDownloadImage = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'lead-magnet.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    background: '#fff',
    color: '#333',
    padding: 24,
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(60,60,100,0.08)',
    boxSizing: 'border-box',
  };
  const mobileStyle: React.CSSProperties = {
    width: '100%',
    padding: 8,
    fontSize: 15,
    borderRadius: 0,
    boxShadow: 'none',
  };
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  // Data extraction
  const title = data?.structured_content?.title_page?.title || '';
  const subtitle = data?.structured_content?.title_page?.subtitle || '';
  const introTitle = data?.structured_content?.introduction_page?.title || '';
  const introContent = data?.structured_content?.introduction_page?.content || '';
  const toolkitSections = data?.structured_content?.toolkit_sections || [];
  const prosConsSection = toolkitSections.find((s: any) => s.type === 'pros_and_cons_list');
  const checklistSection = toolkitSections.find((s: any) => s.type === 'checklist');
  const scriptsSection = toolkitSections.find((s: any) => s.type === 'scripts');
  const ctaTitle = data?.structured_content?.cta_page?.title || '';
  const ctaContent = data?.structured_content?.cta_page?.content || '';
  const bookingLink = data?.bookingLink || '';
  const website = data?.website || '';
  const supportEmail = data?.supportEmail || '';

  return (
    <div>
      <div
        ref={pdfRef}
        id="pdf-content"
        style={isMobile ? { ...containerStyle, ...mobileStyle } : containerStyle}
      >
        {/* Title Page */}
        <h1 style={{ fontSize: isMobile ? 28 : 42, color: '#1a237e', fontWeight: 900, marginBottom: 10 }}>{title}</h1>
        <h2 style={{ fontSize: isMobile ? 16 : 20, color: '#555', fontWeight: 'bold', marginBottom: 30 }}>{subtitle}</h2>
        <div style={{ fontStyle: 'italic', color: '#7986cb', marginBottom: 40, fontSize: isMobile ? 13 : 16 }}>A QuickStrat AI Toolkit</div>
        <h3 style={{ fontWeight: 'bold', fontSize: isMobile ? 15 : 18 }}>{introTitle}</h3>
        {introContent.split('\n').map((line, i) => (
          <p key={i} style={{ fontSize: isMobile ? 14 : 16, lineHeight: 1.6, marginBottom: 10 }}>{line}</p>
        ))}

        {/* Toolkit Overview */}
        <h2 style={{ fontSize: isMobile ? 22 : 28, color: '#283593', borderBottom: '2px solid #5c6bc0', paddingBottom: 10, marginBottom: 20, marginTop: 40 }}>🚀 What You’ll Learn</h2>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 20, marginBottom: 20 }}>
          {toolkitSections.map((section: any, idx: number) => (
            <div key={idx} style={{ flex: 1, padding: 16, border: '1px solid #e0e0e0', borderRadius: 8, background: '#f8f9fa', textAlign: 'center', marginBottom: isMobile ? 16 : 0 }}>
              <div style={{ fontSize: isMobile ? 32 : 48, marginBottom: 10 }}>
                {section.type === 'pros_and_cons_list' ? '🧠' : section.type === 'checklist' ? '✅' : section.type === 'scripts' ? '💬' : '📄'}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: isMobile ? 15 : 18, color: '#3949ab', marginBottom: 6 }}>{section.title}</div>
              <div style={{ fontSize: isMobile ? 13 : 15 }}>{typeof section.content === 'string' ? section.content : ''}</div>
            </div>
          ))}
        </div>

        {/* Pros & Cons Section */}
        {prosConsSection && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: isMobile ? 22 : 28, color: '#283593', borderBottom: '2px solid #5c6bc0', paddingBottom: 10, marginBottom: 20 }}>📊 {prosConsSection.title}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 13 : 15 }}>
                <thead>
                  <tr style={{ background: '#3f51b5', color: '#fff' }}>
                    <th style={{ padding: 12, fontWeight: 'bold' }}>Strategy</th>
                    <th style={{ padding: 12, fontWeight: 'bold' }}>Pros</th>
                    <th style={{ padding: 12, fontWeight: 'bold' }}>Cons</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray((prosConsSection.content as any)?.items) && (prosConsSection.content as any).items.length > 0 ? (prosConsSection.content as any).items.map((item: any, idx: number) => (
                    <tr key={idx} style={{ background: idx % 2 === 1 ? '#f4f6f8' : '#fff' }}>
                      <td style={{ padding: 12, fontWeight: 'bold' }}>{item.method_name}</td>
                      <td style={{ padding: 12 }}>{item.pros}</td>
                      <td style={{ padding: 12 }}>{item.cons}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ padding: 12 }}>No strategies found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {(prosConsSection.content as any)?.example && (
              <div style={{ background: '#e8eaf6', borderLeft: '5px solid #7986cb', padding: 16, marginTop: 24, borderRadius: 8, fontSize: isMobile ? 13 : 16 }}>
                <span style={{ fontWeight: 'bold' }}>💡 Pro Tip:</span> {(prosConsSection.content as any).example}
              </div>
            )}
          </div>
        )}

        {/* Checklist Section */}
        {checklistSection && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: isMobile ? 22 : 28, color: '#283593', borderBottom: '2px solid #5c6bc0', paddingBottom: 10, marginBottom: 20 }}>✅ {checklistSection.title}</h2>
            <div style={{ fontSize: isMobile ? 13 : 15, marginBottom: 16 }}>{typeof checklistSection.content === 'string' ? checklistSection.content : ''}</div>
            <div style={{ background: '#f7f9fc', padding: 20, borderRadius: 8, border: '1px solid #dbe2ef' }}>
              {Array.isArray((checklistSection.content as any)?.phases) && (checklistSection.content as any).phases.length > 0 ? (checklistSection.content as any).phases.map((phase: any, idx: number) => (
                <div key={idx}>
                  <div style={{ fontWeight: 'bold', fontSize: isMobile ? 15 : 18, color: '#3949ab', marginTop: 20 }}>{phase.phase_title}</div>
                  <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                    {phase.items.map((item: string, i: number) => (
                      <li key={i} style={{ fontSize: isMobile ? 15 : 18, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: isMobile ? 18 : 24, marginRight: 12, color: '#3f51b5' }}>🔲</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )) : <div>No checklist items found.</div>}
            </div>
          </div>
        )}

        {/* Scripts Section */}
        {scriptsSection && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: isMobile ? 22 : 28, color: '#283593', borderBottom: '2px solid #5c6bc0', paddingBottom: 10, marginBottom: 20 }}>💬 {scriptsSection.title}</h2>
            {Array.isArray((scriptsSection.content as any)?.scenarios) && (scriptsSection.content as any).scenarios.length > 0 ? (scriptsSection.content as any).scenarios.map((scenario: any, idx: number) => (
              <div key={idx} style={{ marginBottom: 32 }}>
                <div style={{ fontWeight: 'bold', fontSize: isMobile ? 15 : 18, marginBottom: 6 }}>Scenario {idx + 1}: {scenario.trigger}</div>
                <div style={{ fontWeight: 'bold', fontSize: isMobile ? 14 : 16, marginBottom: 4 }}>You say:</div>
                <div style={{ background: '#e3f2fd', borderRadius: 15, padding: 16, fontStyle: 'italic', fontSize: isMobile ? 13 : 16, lineHeight: 1.6, marginBottom: 8 }}>{scenario.response}</div>
                <div style={{ background: '#f1f8e9', padding: 12, borderRadius: 8, marginTop: 8, borderLeft: '4px solid #8bc34a', fontSize: isMobile ? 12 : 15 }}>
                  <span style={{ fontWeight: 'bold' }}>✅ Why it works:</span> {scenario.explanation}
                </div>
              </div>
            )) : <div>No scripts found.</div>}
          </div>
        )}

        {/* CTA Section */}
        <div style={{ marginTop: 48, background: '#1a237e', color: '#fff', textAlign: 'center', padding: isMobile ? 24 : 40, borderRadius: 12 }}>
          <div style={{ color: '#fff', fontSize: isMobile ? 20 : 28, fontWeight: 'bold', marginBottom: 10 }}>{ctaTitle || 'Ready to Get Your Strategy Done For You?'}</div>
          <div style={{ color: '#c5cae9', fontSize: isMobile ? 13 : 16, marginBottom: 20, lineHeight: 1.6 }}>{ctaContent || 'If you want this whole thing done in 30 minutes or less...'}</div>
          {bookingLink && (
            <a href={bookingLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#448aff', color: '#fff', padding: isMobile ? '12px 18px' : '18px 25px', margin: '10px 0', borderRadius: 8, fontSize: isMobile ? 15 : 18, fontWeight: 'bold', textDecoration: 'none' }}>
              🎯 Book a free Strategy Session
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#3949ab', color: '#fff', padding: isMobile ? '12px 18px' : '18px 25px', margin: '10px 0', borderRadius: 8, fontSize: isMobile ? 15 : 18, fontWeight: 'bold', textDecoration: 'none' }}>
              🌐 Explore the tool
            </a>
          )}
          {supportEmail && (
            <div style={{ marginTop: 20, fontSize: isMobile ? 12 : 14, color: '#c5cae9' }}>
              📧 Questions? <a href={`mailto:${supportEmail}`} style={{ color: '#9fa8da', textDecoration: 'underline' }}>{supportEmail}</a>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginTop: 32, justifyContent: 'center' }}>
        <button onClick={handleDownloadPDF} style={{ padding: '16px 32px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 'bold', cursor: 'pointer', marginBottom: isMobile ? 12 : 0 }}>
          Download as PDF
        </button>
        <button onClick={handleDownloadImage} style={{ padding: '16px 32px', background: '#3949ab', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>
          Download as Image
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;
