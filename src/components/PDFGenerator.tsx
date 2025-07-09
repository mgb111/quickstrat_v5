import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, BlobProvider, Image } from '@react-pdf/renderer';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  data: PDFContent;
}

// Helper hook to detect mobile
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);
  return isMobile;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 48,
    minHeight: '100%',
    fontFamily: 'Helvetica',
    lineHeight: 1.7,
  },
  coverPage: {
    flex: 1,
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #4a90e2 0%, #1a365d 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    position: 'relative',
  },
  coverDiagonal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 180,
    backgroundColor: '#4a90e2',
    transform: 'skewY(-8deg)',
    zIndex: 0,
  },
  coverLogo: {
    width: 140,
    height: 140,
    marginBottom: 32,
    objectFit: 'contain',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    zIndex: 1,
  },
  coverTitle: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
    zIndex: 1,
  },
  coverSubtitle: {
    fontSize: 26,
    color: '#e6f7ff',
    marginBottom: 18,
    textAlign: 'center',
    zIndex: 1,
  },
  coverByline: {
    fontSize: 18,
    color: '#b3c6e2',
    marginTop: 32,
    textAlign: 'center',
    zIndex: 1,
  },
  section: {
    marginBottom: 44,
    breakInside: 'avoid',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  sectionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  sectionTitleBar: {
    height: 8,
    width: 36,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
    marginRight: 14,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a365d',
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  h1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 18,
  },
  h3: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 14,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 1.7,
    color: '#4a5568',
    marginBottom: 14,
  },
  bulletList: {
    marginLeft: 24,
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 20,
    color: '#38a169',
    marginRight: 10,
  },
  bulletContent: {
    flex: 1,
    fontSize: 17,
    color: '#4a5568',
  },
  checklistBlock: {
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderLeft: '8px solid #4a90e2',
    boxShadow: '0 2px 8px rgba(74,144,226,0.06)',
  },
  checkbox: {
    fontSize: 20,
    color: '#38a169',
    marginRight: 12,
  },
  checklistText: {
    fontSize: 17,
    color: '#2d3748',
  },
  chatScenario: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  chatResponse: {
    backgroundColor: '#f7fafc',
    borderLeft: '6px solid #38a169',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    color: '#2d3748',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 15,
    color: '#718096',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 15,
    color: '#718096',
  },
  ctaBox: {
    marginTop: 44,
    padding: 36,
    backgroundColor: '#4a90e2',
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(74,144,226,0.10)',
  },
  ctaHeadline: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 22,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  ctaLink: {
    fontSize: 19,
    color: '#fff',
    marginBottom: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#38a169',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
});

const PDFDocument = ({ data }: PDFGeneratorProps) => {
  const content = data?.structured_content;
  if (!content) return null;

  // Dynamic branding and CTA fields
  const logo = data.logo;
  const primaryColor = data.primaryColor || '#1a365d';
  const secondaryColor = data.secondaryColor || '#4a90e2';
  const prosIcon = data.prosIcon || '👍';
  const consIcon = data.consIcon || '👎';
  const checklistIcon = data.checklistIcon || '☑';
  const website = data.website;
  const bookingLink = data.bookingLink;
  const supportEmail = data.supportEmail;
  const ctaText = data.ctaText || content.cta_page.content;
  const mainAction = data.mainAction || 'Book a Call';
  const fontFamily = data.font || 'Helvetica';
  const userName = (data as any).name || 'there';

  const welcomeMessage = `Hi ${userName} — I’m Manish, founder of QuickStrat. I built this toolkit to help solopreneurs like you generate more leads without marketing burnout. Inside, you’ll find actionable strategies, clear frameworks, and proven scripts—all designed to turn your online presence into a client magnet. Let’s dive in.`;

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <Text>{'\n'}</Text>}
      </React.Fragment>
    ));
  };

  const renderIntroductionContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.bulletList}>
          {content.map((point, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>{checklistIcon}</Text>
              <Text style={styles.bulletContent}>{point}</Text>
            </View>
          ))}
        </View>
      );
    }
    return content.split('\n').map((paragraph, i) => (
      <Text key={i} style={styles.bodyText}>{paragraph}</Text>
    ));
  };

  return (
    <Document>
      {/* Branded Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverDiagonal} />
        <View style={styles.coverLogo}>
          {data.logo && <Image src={data.logo} />}
        </View>
        <Text style={styles.coverTitle}>{content.title_page.title}</Text>
        <Text style={styles.coverSubtitle}>{content.title_page.subtitle}</Text>
        <Text style={styles.coverByline}>Created by QuickStrat | Powered by AI</Text>
      </Page>
      {/* Welcome Message Page */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7fafc', borderRadius: 12, padding: 32, marginTop: 60 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: primaryColor, marginBottom: 18, textAlign: 'center' }}>Welcome!</Text>
          <Text style={{ fontSize: 16, color: '#2d3748', textAlign: 'center' }}>{welcomeMessage}</Text>
        </View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `QuickStrat • quickstrat.app • Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ ...styles.h1, textAlign: 'center' }}>{content.introduction_page.title}</Text>
          {content.introduction_page.content.split('\n').map((paragraph, i) => (
            <Text key={i} style={styles.bodyText}>{paragraph}</Text>
          ))}
        </View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `QuickStrat • quickstrat.app • Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
      {/* Toolkit Sections */}
      <Page size="A4" style={styles.page}>
        {content.toolkit_sections.map((section, sectionIndex) => {
          // Defensive: Only access .phases, .items, .scenarios if section.content is an object
          const contentObj = typeof section.content === 'object' && section.content !== null ? section.content : {};
          return (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>{section.type === 'checklist' ? '✅' : section.type === 'pros_and_cons_list' ? '📋' : section.type === 'scripts' ? '💬' : '📄'}</Text>
                <View style={styles.sectionTitleBar} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              {/* Add horizontal rule below section header */}
              <View style={{ height: 4, backgroundColor: '#e6f7ff', borderRadius: 2, marginBottom: 16, marginTop: -8 }} />
              {/* Checklist */}
              {section.type === 'checklist' && Array.isArray(contentObj.phases) && contentObj.phases.map((phase: { phase_title: string; items: string[] }, idx: number) => (
                <View key={idx} style={styles.checklistBlock}>
                  <Text style={styles.h3}>{phase.phase_title}</Text>
                  {phase.items.map((item: string, itemIdx: number) => (
                    <View key={itemIdx} style={styles.bulletItem}>
                      <Text style={styles.checkbox}>☑</Text>
                      <Text style={styles.checklistText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
              {/* Pros & Cons */}
              {section.type === 'pros_and_cons_list' && Array.isArray(contentObj.items) && contentObj.items.map((item: { method_name: string; pros: string; cons: string }, idx: number) => (
                <View key={idx} style={styles.checklistBlock}>
                  <Text style={styles.h3}>{item.method_name}</Text>
                  <View style={styles.bulletItem}><Text style={styles.checkbox}>👍</Text><Text style={styles.checklistText}>Pros: {item.pros}</Text></View>
                  <View style={styles.bulletItem}><Text style={styles.checkbox}>👎</Text><Text style={styles.checklistText}>Cons: {item.cons}</Text></View>
                </View>
              ))}
              {/* Scripts as scenario/response */}
              {section.type === 'scripts' && Array.isArray(contentObj.scenarios) && contentObj.scenarios.map((scenario: { trigger: string; response: string; explanation: string }, idx: number) => (
                <View key={idx} style={styles.checklistBlock}>
                  <Text style={styles.h3}>Scenario: {scenario.trigger}</Text>
                  <View style={styles.chatScenario}>
                    <Text style={styles.bodyText}>Scenario: {scenario.trigger}</Text>
                  </View>
                  <View style={styles.chatResponse}>
                    <Text style={styles.bodyText}><Text style={{ fontWeight: 'bold' }}>Your Response:</Text> {scenario.response}</Text>
                  </View>
                  {scenario.explanation && (
                    <View style={styles.chatResponse}>
                      <Text style={styles.bodyText}>Strategy: {scenario.explanation}</Text>
                    </View>
                  )}
                </View>
              ))}
              {/* Fallback for plain text */}
              {typeof section.content === 'string' && (
                <Text style={styles.bodyText}>{section.content}</Text>
              )}
            </View>
          );
        })}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `QuickStrat • quickstrat.app • Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
      {/* CTA Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaHeadline}>👇 Ready to Turn Strategy Into Clients?</Text>
          {data.bookingLink && (
            <Text style={styles.ctaLink}>🔗 Book a Free Strategy Call{"\n"}{data.bookingLink}</Text>
          )}
          {data.website && (
            <Text style={styles.ctaLink}>🌐 Visit Our Website{"\n"}{data.website}</Text>
          )}
          {data.supportEmail && (
            <Text style={styles.ctaLink}>📬 Questions?{"\n"}Email us at {data.supportEmail}</Text>
          )}
        </View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `QuickStrat • quickstrat.app • Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  if (!data) return <div>No content available</div>;

  const fileName = `${data.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 w-full">
      <BlobProvider document={<PDFDocument data={data} />}>
        {({ url, loading }) => (
          isMobile ? (
            <a
              href={url || '#'}
              download={fileName}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-xs bg-blue-600 text-white text-lg py-4 rounded-xl shadow-lg text-center z-50"
              style={{ zIndex: 50 }}
            >
              {loading ? 'Preparing PDF…' : 'Download PDF'}
            </a>
          ) : (
            <div className="flex justify-end mb-2">
              <a
                href={url || '#'}
                download={fileName}
                className="inline-flex items-center px-4 py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-lg"
              >
                {loading ? 'Preparing download...' : 'Download PDF'}
              </a>
            </div>
          )
        )}
      </BlobProvider>
      {!isMobile && (
        <div style={{ width: '100%', height: '800px' }}>
          <PDFViewer style={{ width: '100%', height: '100%' }}>
            <PDFDocument data={data} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};

export default PDFGenerator;
