// @ts-ignore: No types for html2pdf.js
import React, { useRef } from 'react';
import { PDFContent } from '../types';
import html2pdf from 'html2pdf.js';

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
  
  // Debug case studies
  console.log('Strategy case studies:', strategyRows.filter((row: any) => row.case_study).length);
  console.log('Checklist case study:', checklistSection?.content && typeof checklistSection.content === 'object' && 'case_study' in checklistSection.content ? checklistSection.content.case_study : 'None');
  console.log('Script case studies:', scripts.filter((script: any) => script.case_study).length);
  
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
    // Use static import
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
    <div className="pdf-preview-container">
      <div className="pdf-preview-box" ref={pdfRef}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          .pdf-preview-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: #f8fafc;
            padding: 20px;
            min-height: 100vh;
          }
          
          .pdf-preview-box {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
            max-width: 800px;
            width: 100%;
            padding: 0;
            margin: 0 auto;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
          }
          
          .page {
            background-color: white;
            width: 100%;
            padding: 48px 40px;
            box-sizing: border-box;
            position: relative;
            display: flex;
            flex-direction: column;
            page-break-after: always;
            border-bottom: 1px solid #e5e7eb;
            min-height: 500px;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          
          .page:last-child { 
            page-break-after: avoid; 
            border-bottom: none; 
          }
          
          .page-header { 
            position: absolute;
            top: 16px;
            right: 24px;
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          h1 { 
            font-size: 36px;
            color: #1e293b;
            font-weight: 900;
            margin: 0 0 12px 0;
            line-height: 1.1;
            text-align: center;
          }
          
          h2 { 
            font-size: 28px;
            color: #334155;
            font-weight: 800;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 12px;
            margin: 32px 0 24px 0;
            text-align: center;
          }
          
          h3 { 
            font-size: 20px;
            color: #475569;
            font-weight: 700;
            margin: 24px 0 16px 0;
          }
          
          p, li { 
            font-size: 16px;
            line-height: 1.6;
            color: #334155;
            margin: 0 0 16px 0;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }
          
          a { 
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
          }
          
          .subtitle { 
            font-size: 18px;
            font-weight: 600;
            color: #64748b;
            margin: 0 0 8px 0;
            text-align: center;
          }
          
          .toolkit-credit { 
            font-style: italic;
            color: #94a3b8;
            margin: 0 0 40px 0;
            text-align: center;
            font-size: 14px;
          }
          
          .welcome-header { 
            text-align: center;
            margin-bottom: 32px;
          }
          
          .welcome-header .logo { 
            font-weight: 800;
            font-size: 24px;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .welcome-intro { 
            font-size: 16px;
            margin-bottom: 32px;
            text-align: center;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .welcome-list { 
            list-style: none;
            padding-left: 0;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .welcome-list li { 
            padding-left: 32px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="%233b82f6" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>');
            background-repeat: no-repeat;
            background-position: left center;
            background-size: 20px;
            margin-bottom: 12px;
          }
          
          .learn-container { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
            margin-top: 32px;
            text-align: center;
          }
          
          .learn-item { 
            padding: 32px 24px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transition: all 0.3s ease;
          }
          
          .learn-item:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
          }
          
          .learn-item .icon { 
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
          }
          
          .learn-item h3 { 
            margin: 0 0 8px 0;
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
          }
          
          .learn-item p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
            line-height: 1.5;
          }
          
          .pro-tip { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 1px solid #93c5fd;
            border-left: 4px solid #3b82f6;
            padding: 20px 24px;
            margin-top: 32px;
            border-radius: 8px;
            font-size: 16px;
          }
          
          .pro-tip strong {
            color: #1e40af;
          }
          
          .strategy-table { 
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .strategy-table th, .strategy-table td { 
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
            max-width: 0;
            overflow-wrap: break-word;
          }
          
          .strategy-table th { 
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .strategy-table tr:nth-child(even) { 
            background-color: #f8fafc;
          }
          
          .strategy-table tr:hover {
            background-color: #f1f5f9;
          }
          
          .strategy-table td:first-child { 
            font-weight: 700;
            color: #1e293b;
          }
          
          .checklist-box { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 18px;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            margin-top: 16px;
          }
          
          .checklist { 
            list-style: none;
            padding-left: 0;
            margin: 0;
          }
          
          .checklist li { 
            font-size: 13px;
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            line-height: 1.35;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
          }
          
          .checklist li::before { 
            content: '☐';
            font-size: 16px;
            margin-right: 8px;
            color: #3b82f6;
            margin-top: 2px;
            flex-shrink: 0;
          }
          
          .script { 
            margin-bottom: 32px;
            padding: 14px 16px;
            background: #fafafa;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          .script h3 { 
            border-bottom: none;
            margin-top: 0;
            color: #1e293b;
            font-size: 16px;
          }
          
          .script-dialog { 
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 14px 14px 14px 5px;
            padding: 12px 16px;
            position: relative;
            font-style: italic;
            border: 1px solid #93c5fd;
            margin: 10px 0;
            font-size: 13px;
          }
          
          .script-why { 
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            padding: 10px 14px;
            border-radius: 7px;
            margin-top: 10px;
            font-size: 12px;
            border: 1px solid #86efac;
            border-left: 4px solid #22c55e;
          }
          
          .script-why strong {
            color: #15803d;
          }
          
          .case-study { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #f59e0b;
            border-left: 4px solid #d97706;
            padding: 16px 20px;
            margin: 16px 0;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .case-study strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 15px;
          }
          
          .cta-block { 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            text-align: center;
            padding: 48px 32px;
            border-radius: 12px;
            margin-top: 32px;
          }
          
          .cta-block h2 { 
            color: white;
            border: none;
            margin-bottom: 16px;
          }
          
          .cta-block p {
            color: #cbd5e1;
            font-size: 16px;
            margin-bottom: 24px;
          }
          
          .cta-button { 
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 16px 32px;
            margin: 12px 8px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .cta-button:hover { 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .cta-email { 
            margin-top: 24px;
            font-size: 14px;
          }
          
          .cta-email a { 
            color: #94a3b8;
            text-decoration: underline;
          }
          
          .download-buttons {
            display: flex;
            justify-content: center;
            padding: 24px;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
          }
          
          .download-btn {
            padding: 16px 32px;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
          }
          
          .download-btn:hover {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(30, 41, 59, 0.4);
          }
          
          @media print { 
            .pdf-preview-container {
              background: white;
              padding: 0;
            }
            .pdf-preview-box {
              box-shadow: none;
              border-radius: 0;
            }
            .page { 
              margin: 0;
              padding: 32px;
              box-shadow: none;
              page-break-after: always;
              border: none;
            }
            .page:last-child { 
              page-break-after: avoid;
            }
            .download-buttons {
              display: none;
            }
          }
          
          @media (max-width: 768px) {
            .pdf-preview-container {
              padding: 12px;
            }
            
            .pdf-preview-box {
              border-radius: 8px;
            }
            
            .page {
              padding: 32px 24px;
            }
            
            h1 {
              font-size: 28px;
            }
            
            h2 {
              font-size: 24px;
            }
            
            .learn-container {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .strategy-table {
              font-size: 14px;
            }
            
            .strategy-table th,
            .strategy-table td {
              padding: 12px 8px;
            }
            
            .cta-block {
              padding: 32px 24px;
            }
            
            .cta-button {
              display: block;
              margin: 12px auto;
              width: fit-content;
            }
          }
          .script-dialog, .script-why {
            page-break-inside: avoid;
          }
          .script-dialog {
            padding: 20px;
            border-radius: 20px 20px 20px 5px;
            background-color: #e3f2fd;
            font-style: italic;
            margin-top: 12px;
          }
          .strategy-page-small {
            font-size: 14px;
          }
          .strategy-page-small * {
            font-size: 14px !important;
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
          <div className="welcome-intro">
            {data.founder_intro ? (
              <p>{data.founder_intro}</p>
            ) : (
              data.founderName && data.brandName && data.problemStatement && data.desiredOutcome && (
                <>
                  <p>Hi, I'm {data.founderName}, founder of {data.brandName}. I didn't start out with a tool—I started with a problem.</p>
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
          <div className="page-header">What You'll Learn</div>
          <h2>🚀 What You'll Learn</h2>
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
        <div className="page strategy-page-small">
          <div className="page-header">Step 1 of 3</div>
          <h2>📊 Strategy Showdown: What Actually Works?</h2>
          {strategyRows.length > 0 ? (
            <>
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
              
              {/* Case Studies for Strategies */}
              {strategyRows.some((row: any) => row.case_study) && (
                <div style={{marginTop: '24px'}}>
                  <h3 style={{marginBottom: '16px', color: '#1e293b'}}>📈 Real-World Examples</h3>
                  {strategyRows.map((row: any, idx: number) => (
                    row.case_study && (
                      <div key={idx} className="case-study no-page-break">
                        <strong>💡 {row.method_name} in Action:</strong>
                        {row.case_study}
                      </div>
                    )
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{textAlign:'center', color: '#ef4444', padding: '40px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'}}>
              No strategies found or data missing.
            </div>
          )}
          <div className="pro-tip">
            <strong>💡 Pro Tip:</strong> Pick 1–2 strategies and go deep. Don't spread yourself thin.
          </div>
        </div>

        {/* Step 2: Checklist (robust) */}
        <div className="page">
          <div className="page-header">Step 2 of 3</div>
          <h2>✅ The Social Media Checklist</h2>
          <p style={{textAlign: 'center', marginBottom: '32px'}}>Use this to stay consistent and intentional.</p>
          <div className="checklist-box">
            {checklistPhases.length > 0 ? (
              <>
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
                
                {/* Case Study for Checklist */}
                {checklistSection?.content && 
                 typeof checklistSection.content === 'object' && 
                 'case_study' in checklistSection.content && 
                 checklistSection.content.case_study && (
                  <div className="case-study no-page-break" style={{marginTop: '24px'}}>
                    <strong>📈 Success Story:</strong>
                    {checklistSection.content.case_study}
                  </div>
                )}
              </>
            ) : (
              <div style={{textAlign:'center', color: '#ef4444', padding: '40px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'}}>
                No checklist phases found or data missing.
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Scripts (robust) */}
        <div className="page">
          <div className="page-header">Step 3 of 3</div>
          <h2>💬 Scripts That Turn Comments Into Clients</h2>
          {scripts.length > 0 ? (
            <>
              {scripts.map((scenario: any, idx: number) => (
                idx === 2 ? (
                  <div className="script no-page-break" key={idx} style={{ pageBreakBefore: 'always' }}>
                    <h3>Scenario {idx + 1}: {scenario.trigger}</h3>
                    <p><strong>You say:</strong></p>
                    <div className="script-dialog">{scenario.response}</div>
                    <div className="script-why">✅ <strong>Why it works:</strong> {scenario.explanation}</div>
                    {scenario.case_study && (
                      <div className="case-study no-page-break" style={{marginTop: '12px'}}>
                        <strong>📈 Real Results:</strong>
                        {scenario.case_study}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="script" key={idx}>
                    <h3>Scenario {idx + 1}: {scenario.trigger}</h3>
                    <p><strong>You say:</strong></p>
                    <div className="script-dialog">{scenario.response}</div>
                    <div className="script-why">✅ <strong>Why it works:</strong> {scenario.explanation}</div>
                    {scenario.case_study && (
                      <div className="case-study no-page-break" style={{marginTop: '12px'}}>
                        <strong>📈 Real Results:</strong>
                        {scenario.case_study}
                      </div>
                    )}
                  </div>
                )
              ))}
            </>
          ) : (
            <div style={{textAlign:'center', color: '#ef4444', padding: '40px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'}}>
              No scripts found or data missing.
            </div>
          )}
        </div>

        {/* Page 6: CTA (dynamic) */}
        <div className="page">
          <div className="cta-block no-page-break">
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
      <div className="download-buttons">
        <button onClick={handleDownloadPDF} className="download-btn">
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;