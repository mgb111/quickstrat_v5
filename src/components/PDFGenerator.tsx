import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  data: PDFContent;
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

  const formatText = (text: string) => {
    // Replace \n with proper line breaks and handle spacing
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
        <Text style={styles.methodName}>{item.method_name}</Text>
        <View style={styles.prosCons}>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletContent}>Pros: {formatText(item.pros)}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletContent}>Cons: {formatText(item.cons)}</Text>
          </View>
        </View>
      </View>
    ));
  };

  const renderChecklist = (phases: Array<{phase_title: string; items: string[]}>) => {
    return phases.map((phase, index) => (
      <View key={index} style={styles.section}>
        <Text style={styles.h3}>{phase.phase_title}</Text>
        <View style={styles.bulletList}>
          {phase.items.map((item: string, itemIndex: number) => (
            <View key={itemIndex} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletContent}>{formatText(item)}</Text>
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
            <Text style={styles.scriptLabel}>{`Scenario ${index + 1}: ${formatText(scenario.trigger)}`}</Text>
            <Text style={[styles.scriptLabel, { marginTop: 8 }]}>You say:</Text>
            <Text style={styles.scriptText}>{formatText(scenario.response)}</Text>
            <Text style={styles.scriptLabel}>Strategy:</Text>
            <Text style={styles.scriptText}>{formatText(scenario.explanation)}</Text>
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
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletContent}>{point}</Text>
            </View>
          ))}
        </View>
      );
    }
    // Otherwise, render as paragraphs
    return content.split('\n').map((paragraph, i) => (
      <Text key={i} style={styles.bodyText}>{paragraph}</Text>
    ));
  };

  const renderSection = (section: PDFContent['structured_content']['toolkit_sections'][0]) => {
    if (typeof section.content === 'string') {
      const paragraphs = section.content.split('\n\n');
      return (
        <View style={styles.section}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.bodyText}>{formatText(paragraph)}</Text>
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

    return <Text style={styles.bodyText}>Content not available</Text>;
  };

  return (
    <Document>
      {/* Title Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titlePage}>
          <Text style={styles.titlePageTitle}>
            {formatText(content.title_page.title.split(':')[0])}
          </Text>
          <Text style={[styles.titlePageTitle, { marginTop: 8 }]}>
            {formatText(content.title_page.title.split(':')[1] || '')}
          </Text>
          <Text style={styles.titlePageSubtitle}>{formatText(content.title_page.subtitle)}</Text>
        </View>
      </Page>

      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.h1}>
            {content.introduction_page.title.split('Your').map((part, index) => (
              <React.Fragment key={index}>
                {index > 0 && '\nYour'}{part}
              </React.Fragment>
            ))}
          </Text>
          {renderIntroductionContent(content.introduction_page.content)}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* Content Pages - Render all toolkit sections in a single continuous page */}
      <Page size="A4" style={styles.page}>
        {content.toolkit_sections
          .filter(section => {
            // Deeply check for any non-empty, non-whitespace value in section.content
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
              <Text style={styles.h2}>{formatText(section.title)}</Text>
              {renderSection(section)}
            </View>
          ))}
        {/* Dynamic page number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* CTA Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.ctaTitle}>{formatText(content.cta_page.title)}</Text>
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>{formatText(content.cta_page.content)}</Text>
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

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-end">
        <BlobProvider document={<PDFDocument data={data} />}>
          {({ url, loading }) => (
            <a
              href={url || '#'}
              download={fileName}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                loading || !url
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
              onClick={(e) => {
                if (loading || !url) {
                  e.preventDefault();
                }
              }}
            >
              {loading ? 'Preparing download...' : 'Download PDF'}
            </a>
          )}
        </BlobProvider>
      </div>
      <div style={{ width: '100%', height: '800px' }}>
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          <PDFDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default PDFGenerator;
