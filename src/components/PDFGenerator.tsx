import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, BlobProvider, Image, Link } from '@react-pdf/renderer';
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
    // border: '1px solid red', // Debug border removed
    // To implement: dynamic padding based on content size if needed
  },
  section: {
    marginBottom: 24,
    breakInside: 'avoid',
  },
  titlePage: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titlePageTitle: {
    fontSize: 40,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1a365d',
  },
  titlePageSubtitle: {
    fontSize: 28,
    marginBottom: 36,
    textAlign: 'center',
    color: '#4a5568',
  },
  h1: {
    fontSize: 36,
    marginBottom: 28,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  h2: {
    fontSize: 32,
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  h3: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 16,
    color: '#4a5568',
  },
  bulletPoint: {
    width: 20,
    fontSize: 18,
    color: '#4a5568',
  },
  bulletContent: {
    flex: 1,
    paddingLeft: 12,
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4a5568',
  },
  methodSection: {
    marginBottom: 28,
  },
  methodName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2d3748',
  },
  prosCons: {
    marginLeft: 24,
    marginBottom: 20,
  },
  scriptSection: {
    marginBottom: 28,
    padding: 20,
    backgroundColor: '#f7fafc',
    borderRadius: 4,
  },
  scriptLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4a5568',
  },
  scriptText: {
    fontSize: 16,
    lineHeight: 1.6,
    marginBottom: 12,
    color: '#4a5568',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 14,
    color: '#718096',
  },
  ctaSection: {
    marginTop: 36,
    padding: 28,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2d3748',
  },
  ctaText: {
    fontSize: 18,
    lineHeight: 1.6,
    textAlign: 'center',
    color: '#4a5568',
  },
  bulletList: {
    marginLeft: 24,
    marginBottom: 20,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
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

  // Dynamic styles
  const dynamicStyles = StyleSheet.create({
    ...styles,
    titlePageTitle: {
      ...styles.titlePageTitle,
      color: primaryColor,
      fontFamily,
    },
    h1: {
      ...styles.h1,
      color: primaryColor,
      fontFamily,
    },
    h2: {
      ...styles.h2,
      color: secondaryColor,
      fontFamily,
    },
    h3: {
      ...styles.h3,
      color: secondaryColor,
      fontFamily,
    },
    bodyText: {
      ...styles.bodyText,
      fontFamily,
    },
    scriptLabel: {
      ...styles.scriptLabel,
      color: primaryColor,
      fontFamily,
    },
    scriptText: {
      ...styles.scriptText,
      fontFamily,
    },
    ctaTitle: {
      ...styles.ctaTitle,
      color: primaryColor,
      fontFamily,
    },
    ctaText: {
      ...styles.ctaText,
      fontFamily,
    },
    bulletPoint: {
      ...styles.bulletPoint,
      color: secondaryColor,
      fontFamily,
    },
    bulletContent: {
      ...styles.bulletContent,
      fontFamily,
    },
  });

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <Text>{'\n'}</Text>}
      </React.Fragment>
    ));
  };

  const renderProsConsList = (items: Array<{method_name: string; pros: string; cons: string}>) => {
    return items.map((item, index) => (
      <View key={index} style={styles.methodSection}>
        <Text style={dynamicStyles.methodName}>{item.method_name}</Text>
        <View style={styles.prosCons}>
          <View style={styles.bulletItem}>
            <Text style={dynamicStyles.bulletPoint}>{prosIcon}</Text>
            <Text style={dynamicStyles.bulletContent}>Pros: {formatText(item.pros)}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={dynamicStyles.bulletPoint}>{consIcon}</Text>
            <Text style={dynamicStyles.bulletContent}>Cons: {formatText(item.cons)}</Text>
          </View>
        </View>
      </View>
    ));
  };

  const renderChecklist = (phases: Array<{phase_title: string; items: string[]}>) => {
    return phases.map((phase, index) => (
      <View key={index} style={styles.section}>
        <Text style={dynamicStyles.h3}>{phase.phase_title}</Text>
        <View style={styles.bulletList}>
          {phase.items.map((item: string, itemIndex: number) => (
            <View key={itemIndex} style={styles.bulletItem}>
              <Text style={dynamicStyles.bulletPoint}>{checklistIcon}</Text>
              <Text style={dynamicStyles.bulletContent}>{formatText(item)}</Text>
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const renderScripts = (scenarios: Array<{trigger: string; response: string; explanation: string}>) => {
    return (
      <View>
        {scenarios.map((scenario, index) => (
          <View key={index} style={{ marginBottom: 24 }}>
            <Text style={dynamicStyles.scriptLabel}>{`Scenario ${index + 1}: ${formatText(scenario.trigger)}`}</Text>
            <Text style={[dynamicStyles.scriptLabel, { marginTop: 8 }]}>You say:</Text>
            <Text style={dynamicStyles.scriptText}>{formatText(scenario.response)}</Text>
            <Text style={dynamicStyles.scriptLabel}>Strategy:</Text>
            <Text style={dynamicStyles.scriptText}>{formatText(scenario.explanation)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderIntroductionContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <View style={styles.bulletList}>
          {content.map((point, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={dynamicStyles.bulletPoint}>{checklistIcon}</Text>
              <Text style={dynamicStyles.bulletContent}>{point}</Text>
            </View>
          ))}
        </View>
      );
    }
    return content.split('\n').map((paragraph, i) => (
      <Text key={i} style={dynamicStyles.bodyText}>{paragraph}</Text>
    ));
  };

  const renderSection = (section: PDFContent['structured_content']['toolkit_sections'][0]) => {
    if (typeof section.content === 'string') {
      const paragraphs = section.content.split('\n\n');
      return (
        <View style={styles.section}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={dynamicStyles.bodyText}>{formatText(paragraph)}</Text>
          ))}
        </View>
      );
    }

    if (section.type === 'pros_and_cons_list' && section.content.items) {
      return renderProsConsList(section.content.items);
    }

    if (section.type === 'checklist' && section.content.phases) {
      return renderChecklist(section.content.phases);
    }

    if (section.type === 'scripts' && section.content.scenarios) {
      return renderScripts(section.content.scenarios);
    }

    return <Text style={dynamicStyles.bodyText}>Content not available</Text>;
  };

  return (
    <Document>
      {/* Title Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titlePage}>
          {logo && (
            <Image src={logo} style={{ width: 120, height: 120, marginBottom: 24 }} />
          )}
          <Text style={dynamicStyles.titlePageTitle}>
            {formatText(content.title_page.title.split(':')[0])}
          </Text>
          <Text style={[dynamicStyles.titlePageTitle, { marginTop: 8 }]}> 
            {formatText(content.title_page.title.split(':')[1] || '')}
          </Text>
          <Text style={styles.titlePageSubtitle}>{formatText(content.title_page.subtitle)}</Text>
        </View>
      </Page>

      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.section, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ ...dynamicStyles.h1, textAlign: 'center' }}>
            Unlock the Power of Effective Lead Generation for Solopreneurs
          </Text>
          {renderIntroductionContent(content.introduction_page.content)}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Content Pages - Render all toolkit sections in a single continuous page */}
      <Page size="A4" style={styles.page}>
        {content.toolkit_sections
          .filter(section => {
            const hasDeepContent = (val: any): boolean => {
              if (typeof val === 'string') return val.trim() !== '';
              if (Array.isArray(val)) return val.some(item => hasDeepContent(item));
              if (typeof val === 'object' && val !== null) return Object.values(val).some(item => hasDeepContent(item));
              return !!val;
            };
            return hasDeepContent(section.content);
          })
          .map((section, sectionIndex) => (
            <View key={sectionIndex} style={[styles.section, { marginBottom: 32 }]}> {/* Add extra spacing between sections */}
              <Text style={dynamicStyles.h2}>{formatText(section.title)}</Text>
              {renderSection(section)}
            </View>
          ))}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* CTA Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={dynamicStyles.ctaTitle}>{formatText(content.cta_page.title)}</Text>
          <View style={styles.ctaSection}>
            <Text style={dynamicStyles.ctaText}>{formatText(ctaText)}</Text>
            {/* CTA Links */}
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              {bookingLink && (
                <Link src={bookingLink} style={{ color: secondaryColor, fontSize: 18, textDecoration: 'underline', marginBottom: 8 }}>
                  {mainAction}
                </Link>
              )}
              {website && (
                <Link src={website} style={{ color: secondaryColor, fontSize: 16, textDecoration: 'underline', marginBottom: 8 }}>
                  Visit our website
                </Link>
              )}
              {supportEmail && (
                <Link src={`mailto:${supportEmail}`} style={{ color: secondaryColor, fontSize: 16, textDecoration: 'underline' }}>
                  Contact Support
                </Link>
              )}
            </View>
          </View>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
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
