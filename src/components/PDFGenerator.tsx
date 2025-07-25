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
  requirePayment?: boolean; // New prop to control paywall
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, campaignId, requirePayment = false }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [downloadedAfterPayment, setDownloadedAfterPayment] = useState(false); // Prevent double download
  const [isGenerating, setIsGenerating] = useState(false);

  // When payment is completed, trigger PDF download
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

  // Helper to ensure all fonts are loaded before PDF generation
  async function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    } else {
      // fallback: wait a bit
      await new Promise(res => setTimeout(res, 500));
    }
  }

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    await waitForFonts();
    // Use static import
    const container = pdfRef.current;
    html2pdf()
      .set({
        margin: 0,
        filename: 'lead-magnet.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3, // sharper text
          useCORS: true,
          backgroundColor: '#fff',
          windowWidth: container.scrollWidth || 800,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css'] },
      })
      .from(container)
      .save()
      .finally(() => setIsGenerating(false));
  };

  return (
    <div className="pdf-preview-container" style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className="pdf-preview-box"
        ref={pdfRef}
        style={{
          background: '#fff',
          overflow: 'hidden',
          width: 794, // A4 width at 96dpi
          minHeight: '1123px', // A4 height at 96dpi
          margin: '32px auto',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
          position: 'relative',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          .pdf-preview-box { width: 794px !important; min-height: 1123px; background: #fff; overflow: hidden; }
          .page { width: 100%; min-height: 1000px; background: #fff; box-sizing: border-box; padding: 40px 48px 60px 48px; margin: 0; position: relative; display: flex; flex-direction: column; page-break-after: always; border-bottom: 1px solid #e5e7eb; }
          .page:last-child { page-break-after: avoid; border-bottom: none; }
          .header { display: flex; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; }
          .logo { font-weight: 800; font-size: 24px; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; margin-right: 16px; }
          .doc-title { font-size: 20px; font-weight: 700; color: #334155; }
          .footer { position: absolute; left: 0; right: 0; bottom: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e5e7eb; padding-top: 8px; }
          .section-divider { height: 2px; background: #e5e7eb; margin: 32px 0; border-radius: 1px; }
          h1 { font-size: 32px; color: #1e293b; font-weight: 900; margin: 0 0 16px 0; line-height: 1.1; text-align: center; }
          h2 { font-size: 22px; color: #334155; font-weight: 800; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin: 24px 0 18px 0; text-align: center; }
          h3 { font-size: 16px; color: #475569; font-weight: 700; margin: 18px 0 12px 0; }
          p, li { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 12px 0; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; hyphens: auto; }
          a { color: #3b82f6; text-decoration: none; font-weight: 500; }
          .subtitle { font-size: 16px; font-weight: 600; color: #64748b; margin: 0 0 8px 0; text-align: center; }
          .toolkit-credit { font-style: italic; color: #94a3b8; margin: 0 0 24px 0; text-align: center; font-size: 13px; }
          .pro-tip, .case-study, .script-dialog, .script-why, .cta-block, .checklist-box, .strategy-table { page-break-inside: avoid; }
          .pro-tip { background: #e0f2fe; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin: 18px 0; }
          .case-study { background: #fef9c3; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin: 12px 0; }
          .cta-block { background: #1e293b; color: #fff; text-align: center; padding: 28px 16px; border-radius: 10px; margin-top: 18px; }
          .cta-block h2 { color: #fff; border: none; margin-bottom: 10px; }
          .cta-block p { color: #cbd5e1; font-size: 14px; margin-bottom: 14px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #fff; padding: 10px 18px; margin: 8px 4px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(59,130,246,0.2); }
          .cta-button:hover { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); }
          .download-buttons { display: flex; justify-content: center; padding: 18px; background: #f8fafc; border-top: 1px solid #e5e7eb; }
          .download-btn { padding: 10px 18px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(30,41,59,0.2); }
          .download-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>
        {/* Header with logo and title */}
        <div className="header">
          <div className="logo">{companyName}</div>
          <div className="doc-title">{mainTitle || 'Lead Magnet Toolkit'}</div>
        </div>
        {/* Main content pages */}
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
        {/* Render scripts in groups of 3 per page for better page breaks */}
        {(() => {
          if (!scripts.length) {
            return (
              <div className="page">
                <div className="page-header">Step 3 of 3</div>
                <h2>💬 Scripts That Turn Comments Into Clients</h2>
                <div style={{textAlign:'center', color: '#ef4444', padding: '40px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca'}}>
                  No scripts found or data missing.
                </div>
              </div>
            );
          }
          const pages = [];
          for (let i = 0; i < scripts.length; i += 3) {
            pages.push(
              <div className="page" key={`script-page-${i/3}`}>
                <div className="page-header">Step 3 of 3</div>
                <h2>💬 Scripts That Turn Comments Into Clients</h2>
                {scripts.slice(i, i + 3).map((scenario: any, idx: number) => (
                  <div className="script" key={i + idx}>
                    <h3>Scenario {i + idx + 1}: {scenario.trigger}</h3>
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
                ))}
              </div>
            );
          }
          return pages;
        })()}

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
        {/* Footer with page number and contact (optional) */}
        <div className="footer">
          Page 1 | {website ? <a href={website}>{website}</a> : 'quickstrat.ai'}
        </div>
      </div>
      {/* Download Buttons (outside PDF export area) */}
      <div className="download-buttons relative" style={{ width: 794, margin: '0 auto' }}>
        <button
          onClick={tryDownloadPDF}
          className="download-btn"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating PDF…' : 'Download as PDF'}
        </button>
      </div>
      {requirePayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={async (paymentSuccess = false) => {
            setShowPaymentModal(false);
            if (paymentSuccess) {
              // Refresh subscription status after payment
              const { data: { user } } = await supabase.auth.getUser();
              if (user && user.id) {
                await SubscriptionService.getUserSubscription(user.id);
              }
              setPaymentComplete(true);
              window.location.reload(); // Force full reload to get latest user/subscription state
            }
          }}
        />
      )}
    </div>
  );
};

export default PDFGenerator;