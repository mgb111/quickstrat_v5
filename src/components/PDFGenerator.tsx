// @ts-ignore: No types for html2pdf.js
import React, { useRef, useState } from 'react';
import { PDFContent, LeadMagnetFormat } from '../types';
import html2pdf from 'html2pdf.js';


import { Toaster, toast } from 'react-hot-toast';
import PaymentModal from './PaymentButton';
import { supabase } from '../lib/supabase';
import { SubscriptionService } from '../lib/subscriptionService';

interface PDFGeneratorProps {
  data: PDFContent;
  campaignId: string;
  requirePayment?: boolean; // New prop to control paywall
  selectedFormat?: LeadMagnetFormat; // New prop for format information
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, campaignId, requirePayment = false, selectedFormat }) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [downloadedAfterPayment, setDownloadedAfterPayment] = useState(false); // Prevent double download

  // When payment is completed, trigger PDF download
  React.useEffect(() => {
    if (requirePayment && paymentComplete && !downloadedAfterPayment) {
      setDownloadedAfterPayment(true);
      // Show success toast
      toast.success('Payment successful! Starting PDF download...', {
        duration: 4000,
        icon: '✅',
      });
      // Small delay to let user see success message
      setTimeout(() => {
        handleDownloadPDF();
      }, 500);
    }
  }, [requirePayment, paymentComplete, downloadedAfterPayment]);

  const tryDownloadPDF = async () => {
    if (requirePayment && !paymentComplete) {
      setShowPaymentModal(true);
      return;
    }
    handleDownloadPDF();
  };

  // Format-aware button text
  const getDownloadButtonText = () => {
    const format = selectedFormat || 'pdf';
    
    switch (format) {
      case 'interactive_quiz':
        return paymentComplete && requirePayment ? 'Take Quiz Again' : 'Take Quiz Now';
      case 'roi_calculator':
        return paymentComplete && requirePayment ? 'Use Calculator Again' : 'Use Calculator Now';
      case 'action_plan':
        return paymentComplete && requirePayment ? 'Get Action Plan Again' : 'Get Action Plan';
      case 'benchmark_report':
        return paymentComplete && requirePayment ? 'View Report Again' : 'View Report Now';
      case 'opportunity_finder':
        return paymentComplete && requirePayment ? 'Find Opportunities Again' : 'Find Opportunities';
      default: // pdf
        return paymentComplete && requirePayment ? 'Download PDF Again' : 'Download as PDF';
    }
  };

  // Debug logging to understand the data structure
  console.log('PDFGenerator received data:', data);
  console.log('Structured content:', data.structured_content);

  // Direct mapping from backend data
  const structured = data.structured_content;
  const companyName = (structured?.title_page && 'brand_name' in structured.title_page)
    ? (structured.title_page as any).brand_name || data.brandName || 'Your Brand'
    : data.brandName || 'Your Brand';
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

  // Extract branding fields
  const logo = data.logo;
  const primaryColor = data.primaryColor || '#1a365d';
  const secondaryColor = data.secondaryColor || '#4a90e2';
  const font = data.font || 'Inter';

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    // Show loading toast
    const loadingToast = toast.loading('Generating PDF...', {
      duration: 3000,
    });
    
    try {
      // Use static import
      const container = pdfRef.current;
      await html2pdf()
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
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded successfully!', {
        duration: 3000,
        icon: '📄',
      });
      
      // Track PDF download with Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'download', {
          method: 'PDF',
          file_name: 'lead-magnet.pdf',
          content_type: 'lead_magnet'
        });
      }
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to generate PDF. Please try again.', {
        duration: 4000,
      });
      console.error('PDF generation error:', error);
    }
  };

  return (
    <div
      className="pdf-root"
      style={{ fontFamily: font }}
    >
      <Toaster position="top-right" />
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
              padding: 32px 0;
              margin-bottom: 24px;
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
              padding: 20px 0;
              margin-top: 32px;
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
              padding: 18px 0;
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
              padding: 14px 0;
              font-size: 14px;
            }
            
            .script h3 { 
              border-bottom: none;
              margin-top: 0;
              color: #1e293b;
              font-size: 16px;
            }
            
            .script-dialog { 
              padding: 12px 0;
              position: relative;
              font-style: italic;
              margin: 10px 0;
              font-size: 13px;
            }
            
            .script-why { 
              padding: 10px 0;
              margin-top: 10px;
              font-size: 12px;
            }
            
            .script-why strong {
              color: #15803d;
            }
            
            .case-study { 
              padding: 16px 0;
              margin: 16px 0;
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
            
            /* New elegant styling without boxes */
            .elegant-section {
              margin: 16px 0;
              padding: 0;
            }
            
            .elegant-icon {
              font-size: 24px;
              margin-right: 12px;
              vertical-align: middle;
              color: #3b82f6;
            }
            
            .elegant-title {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin: 16px 0 8px 0;
              display: flex;
              align-items: center;
            }
            
            .elegant-subtitle {
              font-size: 15px;
              font-weight: 600;
              color: #475569;
              margin: 8px 0 4px 0;
              display: flex;
              align-items: center;
            }
            
            .elegant-text {
              font-size: 15px;
              line-height: 1.5;
              color: #334155;
              margin: 8px 0;
              padding-left: 0;
            }
            
            .elegant-list {
              list-style: none;
              padding-left: 0;
              margin: 8px 0;
            }
            
            .elegant-list li {
              padding: 4px 0;
              padding-left: 24px;
              position: relative;
              font-size: 14px;
              line-height: 1.5;
              color: #334155;
            }
            
            .elegant-list li::before {
              content: '✨';
              position: absolute;
              left: 0;
              top: 4px;
              font-size: 14px;
            }
            
            .elegant-highlight {
              padding: 8px 0;
              margin: 8px 0;
            }
            
            .elegant-quote {
              font-style: italic;
              color: #64748b;
              font-size: 14px;
              margin: 8px 0;
              padding-left: 24px;
              position: relative;
            }
            
            .elegant-quote::before {
              content: '"';
              position: absolute;
              left: 0;
              top: 0;
              font-size: 18px;
              color: #3b82f6;
              font-weight: bold;
            }
            
            .elegant-step {
              margin: 8px 0;
              padding-left: 24px;
              position: relative;
            }
            
            .elegant-step::before {
              content: '→';
              position: absolute;
              left: 0;
              top: 0;
              font-size: 14px;
              color: #3b82f6;
              font-weight: bold;
            }
            
            .elegant-tip, .elegant-warning, .elegant-success {
              margin: 8px 0;
              padding: 8px 0;
              font-size: 13px;
            }
            
            .pro-tip {
              padding: 8px 0;
              margin-top: 12px;
              font-size: 14px;
            }
            
            .case-study {
              padding: 8px 0;
              margin: 8px 0;
              font-size: 13px;
              line-height: 1.5;
            }
            
            .script-dialog {
              padding: 8px 0;
              position: relative;
              font-style: italic;
              margin: 6px 0;
              font-size: 13px;
            }
            
            .script-why {
              padding: 6px 0;
              margin-top: 6px;
              font-size: 12px;
            }
            
            .script {
              margin-bottom: 16px;
              padding: 8px 0;
              font-size: 13px;
            }
            
            .checklist-box {
              padding: 8px 0;
              margin-top: 8px;
            }
            
            .learn-item {
              padding: 16px 0;
              margin-bottom: 12px;
            }
          `}</style>

          {/* Logo at the top if provided */}
          {logo && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img src={logo} alt="Logo" style={{ maxHeight: 64, maxWidth: 200, objectFit: 'contain', margin: '0 auto' }} />
            </div>
          )}
          {/* Page 1: Welcome */}
          <div className="page" id="pdf-content">
            <div className="page-header" style={{ color: primaryColor }}>Step 1 of 3</div>
            
            <div className="welcome-header">
              <h1>{mainTitle}</h1>
              <p className="subtitle">{subtitle}</p>
            </div>
            
            <div className="elegant-section">
              <p className="elegant-text" style={{ marginBottom: '48px' }}>
                {(() => {
                  // Handle founder_intro as either string or object
                  if (typeof data.founder_intro === 'string') {
                    return data.founder_intro;
                  } else if (typeof data.founder_intro === 'object' && data.founder_intro !== null) {
                    // If it's an object with intro_text, use that
                    if ('intro_text' in data.founder_intro && typeof (data.founder_intro as any).intro_text === 'string') {
                      return (data.founder_intro as any).intro_text;
                    }
                    // If it's an object with other properties, construct a string
                    const intro = data.founder_intro as any;
                    if (intro.name && intro.title && intro.company) {
                      return `Hi, I'm ${intro.name}, ${intro.title} of ${intro.company}. ${intro.intro_text || 'I created this guide to help you achieve your goals.'}`;
                    }
                  }
                  // Fallback to default text
                  return `Hi, I'm ${data.founderName || 'Your Name'}, ${data.position || 'founder'} of ${data.brandName || 'Your Brand'}. I didn't start out with a tool that could solve ${data.problemStatement || 'your business challenges'}. It took me years of trial and error to figure out what actually works for ${data.desiredOutcome || 'achieving your goals'}. That's why I created this guide—to save you the time and frustration I went through.`;
                })()}
              </p>
              
              <h3 className="elegant-title">
                <span className="elegant-icon">🎯</span>
                What You'll Discover
              </h3>
              
              <ul className="elegant-list">
                <li>Actionable strategies you can implement immediately</li>
                <li>Proven frameworks that actually work</li>
                <li>Insider tips from real-world experience</li>
                <li>Step-by-step processes for guaranteed results</li>
              </ul>
            </div>
          </div>

          {/* Page 2: What You'll Learn */}
          <div className="page">
            <div className="page-header">Step 2 of 3</div>
            <h2>🚀 The 3-Step Lead Magnet System</h2>
            
            <div className="elegant-section">
              <h3 className="elegant-title">
                <span className="elegant-icon">🧠</span>
                Step 1: Pick Your Strategy
              </h3>
              <p className="elegant-text">Understand what works (and what drains your time) with proven methodologies that have been tested in real-world scenarios.</p>
              
              <h3 className="elegant-title">
                <span className="elegant-icon">✅</span>
                Step 2: Follow the Checklist
              </h3>
              <p className="elegant-text">Nail the daily actions that drive results with our comprehensive action plan designed for maximum efficiency.</p>
              
              <h3 className="elegant-title">
                <span className="elegant-icon">💬</span>
                Step 3: Use Proven Scripts
              </h3>
              <p className="elegant-text">Say the right thing when people show interest with battle-tested scripts that convert prospects into customers.</p>
            </div>
          </div>

          {/* Step 1: Strategy Analysis */}
          <div className="page">
            <div className="page-header" style={{ color: primaryColor }}>Strategy Analysis</div>
            <h2>📊 Strategy Showdown: What Actually Works?</h2>
            
            {strategyRows.length > 0 ? (
              <div className="elegant-section">
                {strategyRows.map((row: any, idx: number) => (
                  <div key={idx} className="elegant-highlight">
                    <h3 className="elegant-subtitle">
                      <span className="elegant-icon">🎯</span>
                      {row.method_name}
                    </h3>
                    
                    <div className="elegant-step">
                      <strong>✅ Pros:</strong> {row.pros}
                    </div>
                    
                    <div className="elegant-step">
                      <strong>⚠️ Cons:</strong> {row.cons}
                    </div>
                    
                    {row.case_study && (
                      <div className="elegant-quote">
                        <strong>💡 Real Example:</strong> {row.case_study}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="elegant-tip">
                  <strong>Pro Tip:</strong> Pick 1–2 strategies and go deep. Don't spread yourself thin.
                </div>
              </div>
            ) : (
              <div className="elegant-warning">
                No strategies found or data missing. Please check your campaign configuration.
              </div>
            )}
          </div>

          {/* Step 2: Checklist */}
          <div className="page">
            <div className="page-header">Action Checklist</div>
            <h2>✅ The Social Media Checklist</h2>
            <p className="elegant-text" style={{textAlign: 'center', marginBottom: '32px'}}>Use this to stay consistent and intentional.</p>
            
            {checklistPhases.length > 0 ? (
              <div className="elegant-section">
                {checklistPhases.map((phase: any, idx: number) => (
                  <div key={idx} className="elegant-highlight">
                    <h3 className="elegant-title">
                      <span className="elegant-icon">📋</span>
                      {phase.phase_title}
                    </h3>
                    
                    <ul className="elegant-list">
                      {phase.items.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                {/* Case Study for Checklist */}
                {checklistSection?.content && 
                 typeof checklistSection.content === 'object' && 
                 'case_study' in checklistSection.content && 
                 checklistSection.content.case_study && (
                  <div className="elegant-success">
                    <strong>📈 Success Story:</strong> {checklistSection.content.case_study}
                  </div>
                )}
              </div>
            ) : (
              <div className="elegant-warning">
                No checklist phases found or data missing. Please check your campaign configuration.
              </div>
            )}
          </div>

          {/* Step 3: Scripts */}
          <div className="page">
            <div className="page-header">Conversation Scripts</div>
            <h2>💬 Scripts That Turn Comments Into Clients</h2>
            
            {scripts.length > 0 ? (
              <div className="elegant-section">
                {scripts.map((scenario: any, idx: number) => (
                  <div key={idx} className="elegant-highlight">
                    <h3 className="elegant-title">
                      <span className="elegant-icon">💬</span>
                      Scenario {idx + 1}: {scenario.trigger}
                    </h3>
                    
                    <div className="elegant-step">
                      <strong>You say:</strong>
                    </div>
                    
                    <div className="elegant-quote">
                      {scenario.response}
                    </div>
                    
                    <div className="elegant-success">
                      <strong>Why it works:</strong> {scenario.explanation}
                    </div>
                    
                    {scenario.case_study && (
                      <div className="elegant-tip">
                        <strong>📈 Real Results:</strong> {scenario.case_study}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="elegant-warning">
                No scripts found or data missing. Please check your campaign configuration.
              </div>
            )}
          </div>

          {/* Page 6: CTA (dynamic) */}
          {(
            data.ctaText || data.mainAction || data.bookingLink || data.website || data.supportEmail
          ) && (
            <div className="page">
              <div className="cta-block no-page-break">
                <h2>{data.ctaText || ctaTitle}</h2>
                <p>{data.cta || data.structured_content?.cta_page?.content || ctaContent}</p>
                {data.bookingLink && (
                  <a href={data.bookingLink} target="_blank" rel="noopener noreferrer" className="cta-button">
                    🎯 {data.mainAction || 'Book a free Strategy Session'}
                  </a>
                )}
                {data.website && (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="cta-button">
                    🌐 Explore the tool
                  </a>
                )}
                {data.supportEmail && (
                  <p className="cta-email">
                    📧 Questions? <a href={`mailto:${data.supportEmail}`}>{data.supportEmail}</a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Download Buttons (outside PDF export area) */}
        <div className="download-buttons relative">
          {paymentComplete && requirePayment && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-green-600 font-semibold mb-2">✅ Payment Successful!</div>
              <div className="text-green-700 text-sm">Your PDF download will start automatically...</div>
            </div>
          )}
          <button
            onClick={tryDownloadPDF}
            className="download-btn"
          >
            {getDownloadButtonText()}
          </button>
        </div>
        {requirePayment && (
          <PaymentModal
            isOpen={showPaymentModal}
            selectedFormat={selectedFormat}
            onClose={async (paymentSuccess = false) => {
              setShowPaymentModal(false);
              if (paymentSuccess) {
                // Refresh subscription status after payment
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.id) {
                  await SubscriptionService.getUserSubscription(user.id);
                }
                setPaymentComplete(true);
                // Remove the jarring page reload - let the useEffect handle the download
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PDFGenerator;