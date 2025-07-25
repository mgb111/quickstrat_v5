// @ts-ignore: No types for html2pdf.js
import React, { useRef, useState } from 'react';
import { PDFContent } from '../types';
import html2pdf from 'html2pdf.js';

import { Toaster } from 'react-hot-toast';
import PaymentModal from './PaymentButton';
import { supabase } from '../lib/supabase';
import { SubscriptionService } from '../lib/subscriptionService';

interface PDFGeneratorProps {
  data: PDFContent;
  campaignId: string;
  requirePayment?: boolean;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, campaignId, requirePayment = false }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [downloadedAfterPayment, setDownloadedAfterPayment] = useState(false);

  React.useEffect(() => {
    if (requirePayment && paymentComplete && !downloadedAfterPayment) {
      setDownloadedAfterPayment(true);
      handleDownloadPDF();
    }
  }, [requirePayment, paymentComplete, downloadedAfterPayment]);

  const tryDownloadPDF = async () => {
    if (requirePayment && !paymentComplete) {
      setShowPaymentModal(true);
      return;
    }
    handleDownloadPDF();
  };

  // Debug logging
  console.log('PDFGenerator received data:', data);
  console.log('Structured content:', data.structured_content);

  // Direct mapping from backend data
  const structured = data.structured_content;
  const companyName = (structured?.title_page && 'brand_name' in structured.title_page)
    ? (structured.title_page as any).brand_name || 'QuickStrat'
    : 'QuickStrat';
  const mainTitle = structured?.title_page?.title || '';
  const subtitle = structured?.title_page?.subtitle || '';
  
  const toolkit_sections = structured?.toolkit_sections || [];
  
  const strategySection = toolkit_sections.find((s: any) => s.type === 'pros_and_cons_list');
  const checklistSection = toolkit_sections.find((s: any) => s.type === 'checklist');
  const scriptsSection = toolkit_sections.find((s: any) => s.type === 'scripts');
  
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

  // Helper functions to parse string content
  function parseProsAndConsFromString(content: string): any[] {
    const items: any[] = [];
    const lines = content.split('\n');
    let currentItem: any = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.match(/^\d+\./)) {
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
    <div className="pdf-preview-container pdf-mode">
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
            padding: 40px;
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
          
          /* Typography - Clean and consistent */
          h1 { 
            font-size: 32px;
            color: #1e293b;
            font-weight: 800;
            margin: 0 0 16px 0;
            line-height: 1.2;
            text-align: center;
          }
          
          h2 { 
            font-size: 24px;
            color: #1e293b;
            font-weight: 700;
            margin: 0 0 24px 0;
            text-align: center;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
          }
          
          h3 { 
            font-size: 18px;
            color: #374151;
            font-weight: 600;
            margin: 20px 0 12px 0;
            line-height: 1.3;
          }
          
          p, li { 
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            margin: 0 0 12px 0;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          
          a { 
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
          }
          
          .subtitle { 
            font-size: 16px;
            font-weight: 500;
            color: #6b7280;
            margin: 0 0 8px 0;
            text-align: center;
          }
          
          .toolkit-credit { 
            font-style: italic;
            color: #9ca3af;
            margin: 0 0 32px 0;
            text-align: center;
            font-size: 14px;
          }
          
          /* Welcome Page */
          .welcome-header { 
            text-align: center;
            margin-bottom: 24px;
          }
          
          .welcome-header .logo { 
            font-weight: 800;
            font-size: 20px;
            color: #1e293b;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .welcome-intro { 
            font-size: 15px;
            margin-bottom: 24px;
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
            padding: 8px 0 8px 32px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%233b82f6" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>');
            background-repeat: no-repeat;
            background-position: left 10px;
            background-size: 16px;
            margin-bottom: 8px;
          }
          
          /* Learn Container */
          .learn-container { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 24px;
            text-align: center;
          }
          
          .learn-item { 
            padding: 24px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 140px;
          }
          
          .learn-item .icon { 
            font-size: 32px;
            margin-bottom: 12px;
            display: block;
          }
          
          .learn-item h3 { 
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }
          
          .learn-item p {
            margin: 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.4;
          }
          
          /* Consistent Box Styling */
          .content-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            display: flex;
            flex-direction: column;
          }
          
          .content-box > *:first-child {
            margin-top: 0 !important;
          }
          
          .content-box > *:last-child {
            margin-bottom: 0 !important;
          }
          
          /* Pro Tip */
          .pro-tip { 
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 16px 0;
          }
          
          .pro-tip strong {
            color: #1d4ed8;
          }
          
          /* Strategy Table */
          .strategy-table { 
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .strategy-table th, .strategy-table td { 
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .strategy-table th { 
            background: #3b82f6;
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .strategy-table tr:nth-child(even) { 
            background-color: #f8fafc;
          }
          
          .strategy-table td:first-child { 
            font-weight: 600;
            color: #1e293b;
          }
          
          /* Checklist */
          .checklist-box { 
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 16px 0;
          }
          
          .checklist { 
            list-style: none;
            padding-left: 0;
            margin: 0;
          }
          
          .checklist li { 
            font-size: 14px;
            margin-bottom: 8px;
            display: flex;
            align-items: flex-start;
            line-height: 1.5;
          }
          
          .checklist li::before { 
            content: '☐';
            font-size: 16px;
            margin-right: 12px;
            color: #3b82f6;
            margin-top: 1px;
            flex-shrink: 0;
          }
          
          /* Scripts */
          .script { 
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
          }
          
          .script h3 { 
            margin: 0 0 16px 0;
            color: #1e293b;
            font-size: 16px;
            font-weight: 600;
          }
          
          .script-dialog { 
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 16px;
            margin: 12px 0;
            font-style: italic;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .script-why { 
            background: #dcfce7;
            border: 1px solid #86efac;
            border-left: 4px solid #22c55e;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 12px 0;
            font-size: 13px;
            line-height: 1.5;
          }
          
          .script-why strong {
            color: #15803d;
          }
          
          /* Case Studies */
          .case-study { 
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 16px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .case-study strong {
            color: #92400e;
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
          }
          
          /* CTA Block */
          .cta-block { 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            text-align: center;
            padding: 32px 24px;
            border-radius: 8px;
            margin: 16px 0;
          }
          
          .cta-block h2 { 
            color: white;
            border: none;
            margin-bottom: 16px;
          }
          
          .cta-block p {
            color: #cbd5e1;
            font-size: 15px;
            margin-bottom: 20px;
          }
          
          .cta-button { 
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            margin: 8px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
          }
          
          .cta-email { 
            margin-top: 20px;
            font-size: 13px;
          }
          
          .cta-email a { 
            color: #94a3b8;
            text-decoration: underline;
          }
          
          /* Download Buttons */
          .download-buttons {
            display: flex;
            justify-content: center;
            padding: 24px;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
          }
          
          .download-btn {
            padding: 16px 32px;
            background: #1e293b;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .download-btn:hover {
            background: #0f172a;
            transform: translateY(-2px);
          }
          
          /* Error States */
          .error-message {
            text-align: center;
            color: #dc2626;
            padding: 32px;
            background: #fef2f2;
            border-radius: 8px;
            border: 1px solid #fecaca;
            margin: 16px 0;
          }

          /* PDF Specific Optimizations */
          .pdf-mode .content-box,
          .pdf-mode .pro-tip,
          .pdf-mode .case-study,
          .pdf-mode .script,
          .pdf-mode .checklist-box,
          .pdf-mode .cta-block {
            page-break-inside: avoid;
          }

          /* Smaller text for strategy page to fit better */
          .strategy-page-small {
            font-size: 13px;
          }
          
          .strategy-page-small h2 {
            font-size: 20px;
          }
          
          .strategy-page-small h3 {
            font-size: 16px;
          }
          
          .strategy-page-small .strategy-table th,
          .strategy-page-small .strategy-table td {
            font-size: 12px;
            padding: 10px 12px;
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
            
            .page {
              padding: 24px 20px;
            }
            
            h1 {
              font-size: 28px;
            }
            
            h2 {
              font-size: 22px;
            }
            
            .learn-container {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .strategy-table th,
            .strategy-table td {
              padding: 8px 10px;
              font-size: 13px;
            }
            
            .cta-block {
              padding: 24px 20px;
            }
            
            .cta-button {
              display: block;
              margin: 12px auto 8px auto;
              width: fit-content;
            }
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

        {/* Page 2: What You'll Learn */}
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

        {/* Step 1: Strategy Table */}
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
                <div style={{marginTop: '20px'}}>
                  <h3 style={{marginBottom: '16px', color: '#1e293b'}}>📈 Real-World Examples</h3>
                  {strategyRows.map((row: any, idx: number) => (
                    row.case_study && (
                      <div key={idx} className="case-study">
                        <strong>💡 {row.method_name} in Action:</strong>
                        {row.case_study}
                      </div>
                    )
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="error-message">
              No strategies found or data missing.
            </div>
          )}
          <div className="pro-tip">
            <strong>💡 Pro Tip:</strong> Pick 1–2 strategies and go deep. Don't spread yourself thin.
          </div>
        </div>

        {/* Step 2: Checklist */}
        <div className="page">
          <div className="page-header">Step 2 of 3</div>
          <h2>✅ The Social Media Checklist</h2>
          <p style={{textAlign: 'center', marginBottom: '24px'}}>Use this to stay consistent and intentional.</p>
          
          {checklistPhases.length > 0 ? (
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
              
              {/* Case Study for Checklist */}
              {checklistSection?.content && 
               typeof checklistSection.content === 'object' && 
               'case_study' in checklistSection.content && 
               checklistSection.content.case_study && (
                <div className="case-study" style={{marginTop: '20px'}}>
                  <strong>📈 Success Story:</strong>
                  {checklistSection.content.case_study}
                </div>
              )}
            </div>
          ) : (
            <div className="error-message">
              No checklist phases found or data missing.
            </div>
          )}
        </div>

        {/* Step 3: Scripts */}
        <div className="page">
          <div className="page-header">Step 3 of 3</div>
          <h2>💬 Scripts That Turn Comments Into Clients</h2>
          {scripts.length > 0 ? (
            <>
              {scripts.map((scenario: any, idx: number) => (
                <div key={idx} className="script">
                  <h3>Scenario {idx + 1}: {scenario.trigger}</h3>
                  <p><strong>You say:</strong></p>
                  <div className="script-dialog">{scenario.response}</div>
                  <div className="script-why">
                    <strong>✅ Why it works:</strong> {scenario.explanation}
                  </div>
                  {scenario.case_study && (
                    <div className="case-study">
                      <strong>📈 Real Results:</strong>
                      {scenario.case_study}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="error-message">
              No scripts found or data missing.
            </div>
          )}
        </div>

        {/* Page 6: CTA */}
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
      
      {/* Download Buttons */}
      <div className="download-buttons">
        <button onClick={tryDownloadPDF} className="download-btn">
          Download as PDF
        </button>
      </div>
      
      {requirePayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={async (paymentSuccess = false) => {
            setShowPaymentModal(false);
            if (paymentSuccess) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user && user.id) {
                await SubscriptionService.getUserSubscription(user.id);
              }
              setPaymentComplete(true);
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

export default PDFGenerator;