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
    padding: 40,
    minHeight: '100%',
  },
  coverPage: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    alignItems: 'stretch',
    minHeight: '100%',
  },
  coverSidebar: {
    width: 32,
    backgroundColor: '#4a90e2',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  coverContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  coverLogo: {
    width: 100,
    height: 100,
    marginBottom: 24,
    objectFit: 'contain',
  },
  coverTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 24,
    color: '#4a5568',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverByline: {
    fontSize: 16,
    color: '#718096',
    marginTop: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
    breakInside: 'avoid',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitleBar: {
    height: 8,
    width: 32,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 20,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4a5568',
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 24,
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#4a90e2',
    marginRight: 8,
  },
  bulletContent: {
    flex: 1,
    fontSize: 16,
    color: '#4a5568',
  },
  checklistBlock: {
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  checkbox: {
    fontSize: 18,
    color: '#38a169',
    marginRight: 10,
  },
  checklistText: {
    fontSize: 16,
    color: '#2d3748',
  },
  chatBubble: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeft: '4px solid #4a90e2',
  },
  theySay: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 4,
  },
  youSay: {
    fontSize: 15,
    color: '#38a169',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 14,
    color: '#718096',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 13,
    color: '#718096',
  },
  ctaBox: {
    marginTop: 36,
    padding: 28,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaHeadline: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 18,
    textAlign: 'center',
  },
  ctaLink: {
    fontSize: 17,
    color: '#2d3748',
    marginBottom: 10,
    textAlign: 'center',
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
        <View style={styles.coverSidebar} />
        <View style={styles.coverContent}>
          {data.logo && <Image src={data.logo} style={styles.coverLogo} />}
          <Text style={styles.coverTitle}>{content.title_page.title}</Text>
          <Text style={styles.coverSubtitle}>{content.title_page.subtitle}</Text>
          <Text style={styles.coverByline}>Created by QuickStrat | Powered by AI</Text>
        </View>
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
              {/* Checklist */}
              {section.type === 'checklist' && Array.isArray(contentObj.phases) && contentObj.phases.map((phase: { phase_title: string; items: string[] }, idx: number) => (
                <View key={idx} style={styles.checklistBlock}>
                  <Text style={styles.h3}>{phase.phase_title}</Text>
                  {phase.items.map((item: string, itemIdx: number) => (
                    <View key={itemIdx} style={styles.bulletItem}>
                      <Text style={styles.checkbox}>✅</Text>
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
                  <Text style={styles.bodyText}><Text style={{ fontWeight: 'bold' }}>Your Response:</Text> {scenario.response}</Text>
                  {scenario.explanation && (
                    <Text style={styles.bodyText}>Strategy: {scenario.explanation}</Text>
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
