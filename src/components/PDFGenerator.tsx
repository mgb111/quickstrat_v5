// @ts-ignore: No types for html2pdf.js
import React, { useRef } from 'react';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  data: PDFContent;
}

// Utility to process/normalize PDF content for toolkit sections
function processPdfContent(raw: any, brandNameFallback = 'QuickStrat') {
  if (!raw) return null;
  if (typeof raw === 'object' && raw.structured_content) return raw;
  if (typeof raw === 'object') {
    return {
      ...raw,
      structured_content: {
        title_page: {
          title: raw.title || `${brandNameFallback} Lead Magnet Guide`,
          subtitle: 'A step-by-step blueprint to help you achieve your goals',
          brand_name: raw.brand_name || brandNameFallback,
        },
        introduction_page: {
          title: 'Introduction',
          content: raw.introduction || ''
        },
        toolkit_sections: raw.sections || [],
        cta_page: {
          title: 'Next Steps',
          content: raw.cta || ''
        }
      }
    };
  }
  return null;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  // Always normalize/structure the data
  const normalized = processPdfContent(data);
  const structured = normalized?.structured_content || {};

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
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
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'lead-magnet.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Dynamic data extraction (now from structured)
  const companyName = (structured.title_page && 'brand_name' in structured.title_page)
    ? (structured.title_page as any).brand_name || 'QuickStrat'
    : 'QuickStrat';
  const mainTitle = structured.title_page?.title || '';
  const subtitle = structured.title_page?.subtitle || '';
  const introParagraphs = [
    structured.introduction_page?.title,
    ...(structured.introduction_page?.content?.split('\n') || [])
  ].filter(Boolean);

  function getSectionContent(type: string, key: string) {
    const section = structured.toolkit_sections?.find((s: any) => s.type === type);
    if (section && typeof section.content === 'object' && section.content !== null && key in section.content) {
      return (section.content as any)[key] || [];
    }
    return [];
  }
  const strategyRows = getSectionContent('pros_and_cons_list', 'items');
  const checklistPhases = getSectionContent('checklist', 'phases');
  const scripts = getSectionContent('scripts', 'scenarios');
  const ctaTitle = structured.cta_page?.title || '';
  const ctaContent = structured.cta_page?.content || '';
  const bookingLink = normalized?.bookingLink || '';
  const website = normalized?.website || '';
  const supportEmail = normalized?.supportEmail || '';

  return (
    <div style={{ overflow: 'visible', width: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; color: #333; -webkit-print-color-adjust: exact; }
        .page { background-color: white; width: 210mm; min-height: 297mm; margin: 20px auto; padding: 25mm; box-shadow: 0 0 10px rgba(0,0,0,0.1); box-sizing: border-box; position: relative; display: flex; flex-direction: column; }
        .page-header { width: 100%; text-align: right; font-size: 14px; color: #888; position: absolute; top: 20mm; right: 25mm; font-weight: bold; }
        h1 { font-size: 42px; color: #1a237e; font-weight: 900; margin-bottom: 10px; }
        h2 { font-size: 28px; color: #283593; border-bottom: 2px solid #5c6bc0; padding-bottom: 10px; margin-top: 20px; margin-bottom: 20px; }
        h3 { font-size: 20px; color: #3949ab; margin-top: 30px; }
        p, li { font-size: 16px; line-height: 1.6; }
        a { color: #304ffe; text-decoration: none; }
        .subtitle { font-size: 20px; font-weight: 700; color: #555; margin-top: 0; margin-bottom: 30px; }
        .toolkit-credit { font-style: italic; color: #7986cb; margin-bottom: 40px; }
        .welcome-header { text-align: center; margin-bottom: 40px; }
        .welcome-header .logo { font-weight: bold; font-size: 24px; color: #333; }
        .welcome-intro { font-size: 18px; }
        .welcome-list { list-style: none; padding-left: 0; }
        .welcome-list li { padding-left: 25px; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23304ffe" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>'); background-repeat: no-repeat; background-position: left center; background-size: 16px; margin-bottom: 10px; }
        .learn-container { display: flex; justify-content: space-around; text-align: center; gap: 20px; margin-top: 40px; }
        .learn-item { flex: 1; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f8f9fa; }
        .learn-item .icon { font-size: 48px; margin-bottom: 15px; }
        .learn-item h3 { margin: 0; font-size: 18px; }
        .pro-tip { background-color: #e8eaf6; border-left: 5px solid #7986cb; padding: 15px 20px; margin-top: 30px; font-size: 16px; }
        .strategy-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .strategy-table th, .strategy-table td { padding: 15px; text-align: left; border-bottom: 1px solid #ddd; }
        .strategy-table th { background-color: #3f51b5; color: white; font-size: 18px; }
        .strategy-table tr:nth-child(even) { background-color: #f4f6f8; }
        .strategy-table td:first-child { font-weight: bold; }
        .checklist-box { background-color: #f7f9fc; padding: 25px; border-radius: 8px; border: 1px solid #dbe2ef; }
        .checklist { list-style: none; padding-left: 0; }
        .checklist li { font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; }
        .checklist li::before { content: '🔲'; font-size: 24px; margin-right: 15px; color: #3f51b5; }
        .script { margin-bottom: 40px; }
        .script h3 { border-bottom: none; }
        .script-dialog { background-color: #e3f2fd; border-radius: 20px 20px 20px 5px; padding: 20px; position: relative; font-style: italic; }
        .script-why { background-color: #f1f8e9; padding: 10px 15px; border-radius: 8px; margin-top: 15px; font-size: 15px; border-left: 4px solid #8bc34a; }
        .cta-block { background-color: #1a237e; color: white; text-align: center; padding: 40px; border-radius: 12px; margin-top: auto; }
        .cta-block h2 { color: white; border: none; }
        .cta-button { display: block; background-color: #448aff; color: white; padding: 18px 25px; margin: 20px auto; border-radius: 8px; font-size: 18px; font-weight: bold; max-width: 80%; transition: background-color 0.3s ease; }
        .cta-button:hover { background-color: #2962ff; }
        .cta-email { margin-top: 20px; }
        .cta-email a { color: #c5cae9; }
        @media print { body { background-color: white; } .page { width: 100%; min-height: 0; margin: 0; padding: 0; box-shadow: none; page-break-after: always; } .page:last-child { page-break-after: avoid; } .cta-block { margin-top: 50px; } }
        @media (max-width: 700px) { .page { width: 100vw; min-width: 0; padding: 10vw 2vw; } .learn-container { flex-direction: column; gap: 10px; } }
      `}</style>

      {/* Page 1: Welcome */}
      <div className="page" ref={pdfRef} id="pdf-content">
        <div className="welcome-header">
          <div className="logo">{companyName}</div>
        </div>
        <h1>{mainTitle}</h1>
        <p className="subtitle">{subtitle}</p>
        <p className="toolkit-credit">A QuickStrat AI Toolkit</p>
        {introParagraphs.map((line, i) => <p className="welcome-intro" key={i}>{line}</p>)}
        <p>Inside, you'll find:</p>
        <ul className="welcome-list">
          <li><strong>Proven strategies</strong> (with no fluff)</li>
          <li>A <strong>plug-and-play checklist</strong> to stay consistent</li>
          <li><strong>Word-for-word scripts</strong> to convert interest into income</li>
        </ul>
        <p>You don't need a marketing degree. Just this 3-step playbook.</p>
        <p>Let’s dive in.</p>
      </div>

      {/* Page 2: What You'll Learn (static) */}
      <div className="page">
        <div className="page-header">What You’ll Learn</div>
        <h2>🚀 What You’ll Learn</h2>
        <h3>The 3-Step Lead Magnet System</h3>
        <div className="learn-container">
          <div className="learn-item">
            <div className="icon">🧠</div>
            <h3>Pick Your Strategy</h3>
            <p>Understand what works (and what drains your time).</p>
          </div>
          <div className="learn-item">
            <div className="icon">✅</div>
            <h3>Follow the Checklist</h3>
            <p>Nail the daily actions that drive results.</p>
          </div>
          <div className="learn-item">
            <div className="icon">💬</div>
            <h3>Use Proven Scripts</h3>
            <p>Say the right thing when people show interest.</p>
          </div>
        </div>
      </div>

      {/* Step 1: Strategy Table (dynamic) */}
      <div className="page">
        <div className="page-header">Step 1 of 3</div>
        <h2>📊 Strategy Showdown: What Actually Works?</h2>
        <table className="strategy-table">
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Pros</th>
              <th>Cons</th>
            </tr>
          </thead>
          <tbody>
            {strategyRows.map((row: any, idx: number) => (
              <tr key={idx}>
                <td><strong>{row.method_name}</strong></td>
                <td>{row.pros}</td>
                <td>{row.cons}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pro-tip">
          <strong>💡 Pro Tip:</strong> Pick 1–2 strategies and go deep. Don’t spread yourself thin.
        </div>
      </div>

      {/* Step 2: Checklist (dynamic) */}
      <div className="page">
        <div className="page-header">Step 2 of 3</div>
        <h2>✅ The Social Media Checklist</h2>
        <p>Use this to stay consistent and intentional.</p>
        <div className="checklist-box">
          {checklistPhases.map((phase: any, idx: number) => (
            <React.Fragment key={idx}>
              <h3>{phase.phase_title}</h3>
              <ul className="checklist">
                {phase.items.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 3: Scripts (dynamic) */}
      <div className="page">
        <div className="page-header">Step 3 of 3</div>
        <h2>💬 Scripts That Turn Comments Into Clients</h2>
        {scripts.map((scenario: any, idx: number) => (
          <div className="script" key={idx}>
            <h3>Scenario {idx + 1}: {scenario.trigger}</h3>
            <p><strong>You say:</strong></p>
            <div className="script-dialog">{scenario.response}</div>
            <div className="script-why">✅ <strong>Why it works:</strong> {scenario.explanation}</div>
          </div>
        ))}
      </div>

      {/* Page 6: CTA (dynamic) */}
      <div className="page">
        <div className="cta-block">
          <h2>{ctaTitle}</h2>
          <p>{ctaContent}</p>
          {bookingLink && (
            <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="cta-button">
              🎯 Book a free Strategy Session
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="cta-button">
              🌐 Explore the tool
            </a>
          )}
          {supportEmail && (
            <p className="cta-email">
              📧 Questions? <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
          )}
        </div>
      </div>

      {/* Download Buttons */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginTop: 32, justifyContent: 'center', overflow: 'visible' }}>
        <button onClick={handleDownloadPDF} style={{ padding: '16px 32px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>
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
