// @ts-ignore: No types for html2pdf.js
import React, { useRef } from 'react';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  data: PDFContent;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  // Debug logging to understand the data structure
  console.log('PDFGenerator received data:', data);
  console.log('Structured content:', data.structured_content);

  // Direct mapping from backend data
  const structured = data.structured_content;
  const companyName = (structured?.title_page && 'brand_name' in structured.title_page)
    ? (structured.title_page as any).brand_name || 'QuickStrat'
    : 'QuickStrat';
  const mainTitle = structured?.title_page?.title || '';
  const subtitle = structured?.title_page?.subtitle || '';
  
  // Directly extract toolkit sections, with type guards
  const toolkit_sections = structured?.toolkit_sections || [];
  console.log('Toolkit sections found:', toolkit_sections.length);
  console.log('Toolkit sections:', toolkit_sections);
  
  // Log each section's structure
  toolkit_sections.forEach((section: any, index: number) => {
    console.log(`Section ${index + 1}:`, {
      title: section.title,
      type: section.type,
      content: section.content,
      layout: section.layout
    });
  });
  
  const strategySection = toolkit_sections.find((s: any) => s.type === 'pros_and_cons_list');
  const checklistSection = toolkit_sections.find((s: any) => s.type === 'checklist');
  const scriptsSection = toolkit_sections.find((s: any) => s.type === 'scripts');
  
  console.log('Strategy section:', strategySection);
  console.log('Checklist section:', checklistSection);
  console.log('Scripts section:', scriptsSection);
  
  // Extract data with better error handling
  const strategyRows = (strategySection && 
    typeof strategySection.content === 'object' && 
    strategySection.content !== null && 
    'items' in strategySection.content)
    ? (strategySection.content as any).items || [] 
    : (strategySection && typeof strategySection.content === 'string')
    ? parseProsAndConsFromString(strategySection.content)
    : [];
    
  const checklistPhases = (checklistSection && 
    typeof checklistSection.content === 'object' && 
    checklistSection.content !== null && 
    'phases' in checklistSection.content)
    ? (checklistSection.content as any).phases || [] 
    : (checklistSection && typeof checklistSection.content === 'string')
    ? parseChecklistFromString(checklistSection.content)
    : [];
    
  const scripts = (scriptsSection && 
    typeof scriptsSection.content === 'object' && 
    scriptsSection.content !== null && 
    'scenarios' in scriptsSection.content)
    ? (scriptsSection.content as any).scenarios || [] 
    : (scriptsSection && typeof scriptsSection.content === 'string')
    ? parseScriptsFromString(scriptsSection.content)
    : [];
    
  console.log('Strategy rows:', strategyRows.length);
  console.log('Checklist phases:', checklistPhases.length);
  console.log('Scripts:', scripts.length);
  
  // Helper functions to parse string content
  function parseProsAndConsFromString(content: string): any[] {
    const items: any[] = [];
    const lines = content.split('\n');
    let currentItem: any = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^\d+\./)) {
        // New item starting
        if (currentItem.method_name) {
          items.push(currentItem);
        }
        currentItem = { method_name: trimmedLine.replace(/^\d+\.\s*/, '') };
      } else if (trimmedLine.startsWith('Pros:')) {
        currentItem.pros = trimmedLine.replace('Pros:', '').trim();
      } else if (trimmedLine.startsWith('Cons:')) {
        currentItem.cons = trimmedLine.replace('Cons:', '').trim();
      }
    }
    
    if (currentItem.method_name) {
      items.push(currentItem);
    }
    
    return items;
  }
  
  function parseChecklistFromString(content: string): any[] {
    const phases: any[] = [];
    const lines = content.split('\n');
    let currentPhase: any = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Phase')) {
        if (currentPhase) {
          phases.push(currentPhase);
        }
        currentPhase = {
          phase_title: trimmedLine,
          items: []
        };
      } else if (trimmedLine.match(/^\d+\.\d+/) && currentPhase) {
        currentPhase.items.push(trimmedLine);
      }
    }
    
    if (currentPhase) {
      phases.push(currentPhase);
    }
    
    return phases;
  }
  
  function parseScriptsFromString(content: string): any[] {
    const scenarios: any[] = [];
    const lines = content.split('\n');
    let currentScenario: any = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Scenario')) {
        if (currentScenario.trigger) {
          scenarios.push(currentScenario);
        }
        currentScenario = {};
      } else if (trimmedLine.startsWith('When they say:')) {
        currentScenario.trigger = trimmedLine.replace('When they say:', '').replace(/"/g, '').trim();
      } else if (trimmedLine.startsWith('You say:')) {
        currentScenario.response = trimmedLine.replace('You say:', '').replace(/"/g, '').trim();
      } else if (trimmedLine.startsWith('Strategy:')) {
        currentScenario.explanation = trimmedLine.replace('Strategy:', '').trim();
      }
    }
    
    if (currentScenario.trigger) {
      scenarios.push(currentScenario);
    }
    
    return scenarios;
  }
  
  const ctaTitle = structured?.cta_page?.title || '';
  const ctaContent = structured?.cta_page?.content || '';
  const bookingLink = data?.bookingLink || '';
  const website = data?.website || '';
  const supportEmail = data?.supportEmail || '';

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    // Select the parent container to include all .page elements
    const container = pdfRef.current;
    html2pdf()
      .set({
        margin: 0,
        filename: 'lead-magnet.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      })
      .from(container)
      .save();
  };

  return (
    <div className="pdf-preview-box">
      <div style={{ overflow: 'visible', width: '100%' }} ref={pdfRef}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; color: #333; -webkit-print-color-adjust: exact; }
          .pdf-preview-box {
            background: #fff;
            border-radius: 18px;
            box-shadow: 0 4px 32px rgba(0,0,0,0.08), 0 1.5px 6px rgba(0,0,0,0.04);
            max-width: 900px;
            margin: 32px auto;
            padding: 32px 32px 40px 32px;
            overflow-x: auto;
            width: 100%;
          }
          .page {
            background-color: white;
            width: 100%;
            max-width: 210mm;
            min-height: 0;
            margin: 0 auto 24px auto;
            padding: clamp(16px, 4vw, 32px);
            box-shadow: 0 0 10px rgba(0,0,0,0.08);
            box-sizing: border-box;
            position: relative;
            display: block;
            flex-direction: column;
            page-break-after: always;
            border-radius: 12px;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          .page:last-child { page-break-after: avoid; margin-bottom: 0; }
          .page-header { width: 100%; text-align: right; font-size: clamp(12px, 1.5vw, 14px); color: #888; position: absolute; top: clamp(12px, 2vw, 24px); right: clamp(12px, 2vw, 24px); font-weight: bold; }
          h1 { font-size: clamp(28px, 6vw, 42px); color: #1a237e; font-weight: 900; margin-bottom: 10px; }
          h2 { font-size: clamp(20px, 4vw, 28px); color: #283593; border-bottom: 2px solid #5c6bc0; padding-bottom: 10px; margin-top: 20px; margin-bottom: 20px; }
          h3 { font-size: clamp(16px, 3vw, 20px); color: #3949ab; margin-top: 30px; }
          p, li { font-size: clamp(14px, 2.5vw, 16px); line-height: 1.6; }
          a { color: #304ffe; text-decoration: none; }
          .subtitle { font-size: clamp(16px, 3vw, 20px); font-weight: 700; color: #555; margin-top: 0; margin-bottom: 30px; }
          .toolkit-credit { font-style: italic; color: #7986cb; margin-bottom: 40px; }
          .welcome-header { text-align: center; margin-bottom: 40px; }
          .welcome-header .logo { font-weight: bold; font-size: clamp(18px, 4vw, 24px); color: #333; }
          .welcome-intro { font-size: clamp(14px, 2.8vw, 18px); }
          .welcome-list { list-style: none; padding-left: 0; }
          .welcome-list li { padding-left: 25px; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%23304ffe" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>'); background-repeat: no-repeat; background-position: left center; background-size: 16px; margin-bottom: 10px; }
          .learn-container { display: flex; flex-wrap: wrap; justify-content: space-around; text-align: center; gap: 20px; margin-top: 40px; }
          .learn-item { flex: 1 1 200px; min-width: 180px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f8f9fa; margin-bottom: 12px; }
          .learn-item .icon { font-size: 48px; margin-bottom: 15px; }
          .learn-item h3 { margin: 0; font-size: 18px; }
          .pro-tip { background-color: #e8eaf6; border-left: 5px solid #7986cb; padding: 15px 20px; margin-top: 30px; font-size: 16px; }
          .strategy-table { width: 100%; border-collapse: collapse; margin-top: 20px; overflow-x: auto; }
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
          @media print { body { background-color: white; } .page { width: 100%; min-height: 0; margin: 0; padding: 0; box-shadow: none; page-break-after: always; display: block; } .page:last-child { page-break-after: avoid; } .cta-block { margin-top: 50px; } }
          @media (max-width: 900px) {
            .pdf-preview-box { max-width: 100vw; border-radius: 0; padding: 2vw 0 32px 0; }
            .page { max-width: 100vw; padding: clamp(12px, 3vw, 24px); border-radius: 0; }
          }
          @media (max-width: 700px) {
            .pdf-preview-box { max-width: 100vw; border-radius: 0; padding: 0 0 24px 0; }
            .page { max-width: 100vw; padding: clamp(8px, 2vw, 16px); border-radius: 0; }
            h1 { font-size: clamp(20px, 7vw, 32px); }
            h2 { font-size: clamp(16px, 5vw, 24px); }
            h3 { font-size: clamp(14px, 4vw, 18px); }
            .welcome-header .logo { font-size: clamp(14px, 6vw, 20px); }
          }
        `}</style>

        {/* Page 1: Welcome */}
        <div className="page" id="pdf-content">
          <div className="welcome-header">
            <div className="logo">{companyName}</div>
          </div>
          <h1>{mainTitle}</h1>
          <p className="subtitle">{subtitle}</p>
          <p className="toolkit-credit">A QuickStrat AI Toolkit</p>
          {/* Personalized founder-style introduction */}
          <div className="welcome-intro" style={{ marginBottom: 32 }}>
            {data.founder_intro ? (
              <p>{data.founder_intro}</p>
            ) : (
              data.founderName && data.brandName && data.problemStatement && data.desiredOutcome && (
                <>
                  <p>Hi, I'm {data.founderName}, founder of {data.brandName}. I didn’t start out with a tool—I started with a problem.</p>
                  <p>I was {data.problemStatement}.</p>
                  <p>So I built something for myself: {data.brandName}.</p>
                  <p>It worked. Now {data.desiredOutcome}.</p>
                </>
              )
            )}
          </div>
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

        {/* Step 1: Strategy Table (robust) */}
        <div className="page">
          <div className="page-header">Step 1 of 3</div>
          <h2>📊 Strategy Showdown: What Actually Works?</h2>
          {strategyRows.length > 0 ? (
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
          ) : (
            <div style={{textAlign:'center', color: 'red'}}>No strategies found or data missing.</div>
          )}
          <div className="pro-tip">
            <strong>💡 Pro Tip:</strong> Pick 1–2 strategies and go deep. Don’t spread yourself thin.
          </div>
        </div>

        {/* Step 2: Checklist (robust) */}
        <div className="page">
          <div className="page-header">Step 2 of 3</div>
          <h2>✅ The Social Media Checklist</h2>
          <p>Use this to stay consistent and intentional.</p>
          <div className="checklist-box">
            {checklistPhases.length > 0 ? (
              checklistPhases.map((phase: any, idx: number) => (
                <React.Fragment key={idx}>
                  <h3>{phase.phase_title}</h3>
                  <ul className="checklist">
                    {phase.items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </React.Fragment>
              ))
            ) : (
              <div style={{textAlign:'center', color: 'red'}}>No checklist phases found or data missing.</div>
            )}
          </div>
        </div>

        {/* Step 3: Scripts (robust) */}
        <div className="page">
          <div className="page-header">Step 3 of 3</div>
          <h2>💬 Scripts That Turn Comments Into Clients</h2>
          {scripts.length > 0 ? (
            scripts.map((scenario: any, idx: number) => (
              <div className="script" key={idx}>
                <h3>Scenario {idx + 1}: {scenario.trigger}</h3>
                <p><strong>You say:</strong></p>
                <div className="script-dialog">{scenario.response}</div>
                <div className="script-why">✅ <strong>Why it works:</strong> {scenario.explanation}</div>
              </div>
            ))
          ) : (
            <div style={{textAlign:'center', color: 'red'}}>No scripts found or data missing.</div>
          )}
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
      </div>
      {/* Download Buttons (outside PDF export area) */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginTop: 32, justifyContent: 'center', overflow: 'visible' }}>
        <button onClick={handleDownloadPDF} style={{ padding: '16px 32px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, fontWeight: 'bold', cursor: 'pointer' }}>
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;
