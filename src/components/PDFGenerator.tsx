// @ts-ignore: No types for html2pdf.js
import React, { useState } from 'react';
import { PDFContent } from '../types';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

import { Toaster } from 'react-hot-toast';
import PaymentModal from './PaymentButton';
import { supabase } from '../lib/supabase';
import { SubscriptionService } from '../lib/subscriptionService';

// Register font (optional, for Inter or fallback)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYw.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYw.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 24,
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#334155',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 700,
    fontSize: 18,
    color: '#1e293b',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
    margin: '18px 0 8px 0',
    textAlign: 'center',
    borderBottom: '2px solid #3b82f6',
    paddingBottom: 4,
  },
  text: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    marginVertical: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
    fontSize: 11,
  },
  tableHeader: {
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 700,
    fontSize: 11,
    padding: 6,
  },
  checklistPhase: {
    fontWeight: 700,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  checklistItem: {
    marginLeft: 12,
    marginBottom: 2,
    fontSize: 11,
  },
  scriptBlock: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    padding: 8,
    marginBottom: 10,
  },
  scriptDialog: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    padding: 6,
    fontStyle: 'italic',
    marginVertical: 4,
    fontSize: 11,
  },
  scriptWhy: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    padding: 6,
    fontSize: 10,
    marginTop: 4,
  },
  caseStudy: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #d97706',
    padding: 6,
    marginVertical: 6,
    fontSize: 10,
  },
  ctaBlock: {
    backgroundColor: '#1e293b',
    color: 'white',
    textAlign: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 18,
  },
  ctaButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: 8,
    borderRadius: 6,
    fontWeight: 600,
    margin: 4,
    textDecoration: 'none',
    fontSize: 12,
    // display: 'inline-block', // Remove, not supported
  },
  ctaEmail: {
    marginTop: 10,
    fontSize: 10,
    color: '#cbd5e1',
  },
});

interface PDFGeneratorProps {
  data: PDFContent;
  campaignId: string;
  requirePayment?: boolean;
}

const PDFDocument = ({ data }: { data: PDFContent }) => {
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
  const strategyRows = (strategySection && typeof strategySection.content === 'object' && strategySection.content !== null && 'items' in strategySection.content)
    ? (strategySection.content as any).items || []
    : [];
  const checklistPhases = (checklistSection && typeof checklistSection.content === 'object' && checklistSection.content !== null && 'phases' in checklistSection.content)
    ? (checklistSection.content as any).phases || []
    : [];
  const scripts = (scriptsSection && typeof scriptsSection.content === 'object' && scriptsSection.content !== null && 'scenarios' in scriptsSection.content)
    ? (scriptsSection.content as any).scenarios || []
    : [];
  const ctaTitle = structured?.cta_page?.title || '';
  const ctaContent = structured?.cta_page?.content || '';
  const bookingLink = data?.bookingLink || '';
  const website = data?.website || '';
  const supportEmail = data?.supportEmail || '';

  return (
    <Document>
      {/* Page 1: Welcome */}
      <Page style={styles.page}>
        <Text style={styles.header}>{companyName}</Text>
        <Text style={styles.sectionTitle}>{mainTitle}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.text}>A QuickStrat AI Toolkit</Text>
        <View style={{ marginTop: 12 }}>
          {data.founder_intro ? (
            <Text style={styles.text}>{data.founder_intro}</Text>
          ) : (
            data.founderName && data.brandName && data.problemStatement && data.desiredOutcome && (
              <>
                <Text style={styles.text}>Hi, I'm {data.founderName}, founder of {data.brandName}. I didn't start out with a tool—I started with a problem.</Text>
                <Text style={styles.text}>I was {data.problemStatement}.</Text>
                <Text style={styles.text}>So I built something for myself: {data.brandName}.</Text>
                <Text style={styles.text}>It worked. Now {data.desiredOutcome}.</Text>
              </>
            )
          )}
        </View>
      </Page>
      {/* Page 2: What You'll Learn */}
      <Page style={styles.page}>
        <Text style={styles.sectionTitle}>🚀 What You'll Learn</Text>
        <Text style={styles.text}>The 3-Step Lead Magnet System</Text>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.text}>🧠 Pick Your Strategy: Understand what works (and what drains your time).</Text>
          <Text style={styles.text}>✅ Follow the Checklist: Nail the daily actions that drive results.</Text>
          <Text style={styles.text}>💬 Use Proven Scripts: Say the right thing when people show interest.</Text>
        </View>
      </Page>
      {/* Step 1: Strategy Table */}
      <Page style={styles.page}>
        <Text style={styles.sectionTitle}>📊 Strategy Showdown: What Actually Works?</Text>
        {strategyRows.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Strategy</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Pros</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Cons</Text>
            </View>
            {strategyRows.map((row: any, idx: number) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableCell}>{row.method_name}</Text>
                <Text style={styles.tableCell}>{row.pros}</Text>
                <Text style={styles.tableCell}>{row.cons}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, border: '1px solid #fecaca', textAlign: 'center' }}>
            No strategies found or data missing.
          </Text>
        )}
        {strategyRows.some((row: any) => row.case_study) && (
          <View style={styles.caseStudy}>
            <Text>📈 Real-World Examples</Text>
            {strategyRows.map((row: any, idx: number) => (
              row.case_study && (
                <Text key={idx} style={styles.text}><Text style={{ fontWeight: 700 }}>{row.method_name} in Action:</Text> {row.case_study}</Text>
              )
            ))}
          </View>
        )}
        <Text style={{ ...styles.text, backgroundColor: '#dbeafe', borderLeft: '4px solid #3b82f6', padding: 6, borderRadius: 6, marginTop: 10 }}>
          💡 Pro Tip: Pick 1–2 strategies and go deep. Don't spread yourself thin.
        </Text>
      </Page>
      {/* Step 2: Checklist */}
      <Page style={styles.page}>
        <Text style={styles.sectionTitle}>✅ The Social Media Checklist</Text>
        <Text style={styles.text}>Use this to stay consistent and intentional.</Text>
        {checklistPhases.length > 0 ? (
          checklistPhases.map((phase: any, idx: number) => (
            <View key={idx}>
              <Text style={styles.checklistPhase}>{phase.phase_title}</Text>
              {phase.items.map((item: string, i: number) => (
                <Text key={i} style={styles.checklistItem}>☐ {item}</Text>
              ))}
            </View>
          ))
        ) : (
          <Text style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, border: '1px solid #fecaca', textAlign: 'center' }}>
            No checklist phases found or data missing.
          </Text>
        )}
        {checklistSection?.content && typeof checklistSection.content === 'object' && 'case_study' in checklistSection.content && checklistSection.content.case_study && (
          <View style={styles.caseStudy}>
            <Text>📈 Success Story: {checklistSection.content.case_study}</Text>
          </View>
        )}
      </Page>
      {/* Step 3: Scripts (grouped 3 per page) */}
      {scripts.length > 0 ? (
        Array.from({ length: Math.ceil(scripts.length / 3) }).map((_, pageIdx) => (
          <Page style={styles.page} key={`script-page-${pageIdx}`}>
            <Text style={styles.sectionTitle}>💬 Scripts That Turn Comments Into Clients</Text>
            {scripts.slice(pageIdx * 3, pageIdx * 3 + 3).map((scenario: any, idx: number) => (
              <View style={styles.scriptBlock} key={idx}>
                <Text style={{ fontWeight: 700 }}>Scenario {pageIdx * 3 + idx + 1}: {scenario.trigger}</Text>
                <Text style={styles.scriptDialog}>{scenario.response}</Text>
                <Text style={styles.scriptWhy}>✅ <Text style={{ fontWeight: 700 }}>Why it works:</Text> {scenario.explanation}</Text>
                {scenario.case_study && (
                  <View style={styles.caseStudy}>
                    <Text>📈 Real Results: {scenario.case_study}</Text>
                  </View>
                )}
              </View>
            ))}
          </Page>
        ))
      ) : (
        <Page style={styles.page}>
          <Text style={styles.sectionTitle}>💬 Scripts That Turn Comments Into Clients</Text>
          <Text style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6, border: '1px solid #fecaca', textAlign: 'center' }}>
            No scripts found or data missing.
          </Text>
        </Page>
      )}
      {/* CTA Page */}
      <Page style={styles.page}>
        <View style={styles.ctaBlock}>
          <Text style={{ fontWeight: 700, fontSize: 14 }}>{ctaTitle}</Text>
          <Text style={{ marginBottom: 8 }}>{ctaContent}</Text>
          {bookingLink && (
            <Link src={bookingLink} style={styles.ctaButton}>
              🎯 Book a free Strategy Session
            </Link>
          )}
          {website && (
            <Link src={website} style={styles.ctaButton}>
              🌐 Explore the tool
            </Link>
          )}
          {supportEmail && (
            <Text style={styles.ctaEmail}>
              📧 Questions? <Link src={`mailto:${supportEmail}`}>{supportEmail}</Link>
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, campaignId, requirePayment = false }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const tryDownloadPDF = async () => {
    if (requirePayment && !paymentComplete) {
      setShowPaymentModal(true);
      return;
    }
    // No-op: download handled by PDFDownloadLink
  };

  return (
    <div className="pdf-preview-container">
      <div className="pdf-preview-box">
        {/* Optionally, render a preview here using HTML or react-pdf's PDFViewer */}
      </div>
      <div className="download-buttons relative">
        <PDFDownloadLink
          document={<PDFDocument data={data} />}
          fileName="lead-magnet.pdf"
        >
          {({ loading }) =>
            loading
              ? <span>Preparing PDF...</span>
              : <button className="download-btn" onClick={tryDownloadPDF}>Download as PDF</button>
          }
        </PDFDownloadLink>
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
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
};

export default PDFGenerator;