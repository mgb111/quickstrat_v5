import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { PDFContent, ToolkitSection } from '../types';

interface PDFGeneratorProps {
  content: PDFContent;
  brandName: string;
  onDownload?: () => void;
}

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  section: {
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subheader: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
    color: '#4B5563',
  },
  ul: {
    marginLeft: 20,
    marginBottom: 10,
  },
  li: {
    fontSize: 12,
    marginBottom: 5,
    color: '#4B5563',
  },
  h4: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

// --- HELPER COMPONENT TO RENDER STRUCTURED PDF CONTENT ---
const renderPdfSection = (section: ToolkitSection, index: number, brandName: string) => {
  const { type } = section;
  const safeContent = 'content' in section ? section.content : undefined;

  const renderContent = () => {
    if (!safeContent) {
      return <Text style={styles.paragraph}>No content available</Text>;
    }

    switch (type) {
      case 'checklist':
        if (!('phases' in safeContent) || !Array.isArray(safeContent.phases)) {
          return <Text style={styles.paragraph}>Invalid checklist format</Text>;
        }
        return (
          <View>
            {safeContent.phases.map((phase: any, pIndex: number) => (
              <View key={pIndex} style={{ marginBottom: 10 }}>
                <Text style={styles.h4}>{phase.phase_title}</Text>
                <View style={styles.ul}>
                  {Array.isArray(phase.items) && phase.items.map((item: string, i: number) => (
                    <Text key={i} style={styles.li}>• {item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      case 'pros_and_cons_list':
        if (!('items' in safeContent) || !Array.isArray(safeContent.items)) {
          return <Text style={styles.paragraph}>Invalid pros and cons format</Text>;
        }
        return (
          <View>
            {safeContent.items.map((item: any, iIndex: number) => (
              <View key={iIndex} style={{ marginBottom: 10 }}>
                <Text style={styles.h4}>{item.method_name || 'Method'}</Text>
                <Text style={{...styles.paragraph, fontWeight: 'bold'}}>Pros:</Text>
                <View style={styles.ul}>
                  {Array.isArray(item.pros) && item.pros.map((pro: string, pIndex: number) => (
                    <Text key={`pro-${pIndex}`} style={styles.li}>• {pro}</Text>
                  ))}
                </View>
                <Text style={{...styles.paragraph, fontWeight: 'bold'}}>Cons:</Text>
                <View style={styles.ul}>
                  {Array.isArray(item.cons) && item.cons.map((con: string, cIndex: number) => (
                    <Text key={`con-${cIndex}`} style={styles.li}>• {con}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      case 'scripts':
        if (!('scenarios' in safeContent) || !Array.isArray(safeContent.scenarios)) {
          return <Text style={styles.paragraph}>Invalid scripts format</Text>;
        }
        return (
          <View>
            {safeContent.scenarios.map((scenario: any, sIndex: number) => (
              <View key={sIndex} style={{ marginBottom: 15 }}>
                <Text style={styles.h4}>Scenario: {scenario.trigger || 'Untitled Scenario'}</Text>
                <Text style={styles.paragraph}>
                  <Text style={{fontWeight: 'bold'}}>Your Response:</Text> {scenario.response || 'No response provided'}
                </Text>
                <Text style={{...styles.paragraph, fontStyle: 'italic'}}>
                  Why this works: {scenario.explanation || 'No explanation provided'}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'table':
        // Ensure headers exist and is a non-empty array, otherwise provide default headers
        const headers = Array.isArray(safeContent?.headers) && safeContent.headers.length > 0 
          ? safeContent.headers 
          : ['Column 1', 'Column 2'];
        
        // Ensure rows is an array, default to empty array if not
        const rows = Array.isArray(safeContent?.rows) ? safeContent.rows : [];
        
        // If no rows, provide a helpful message
        if (rows.length === 0) {
          return (
            <View style={{ marginVertical: 15, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 4 }}>
              <Text style={{...styles.paragraph, textAlign: 'center', fontStyle: 'italic'}}>
                No table data available
              </Text>
            </View>
          );
        }
        
        return (
          <View style={{ marginTop: 10, marginBottom: 15 }}>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
              {headers.map((header: string, hIndex: number) => (
                <View key={`header-${hIndex}`} style={{ flex: 1, padding: 8, backgroundColor: '#F3F4F6' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{header || `Column ${hIndex + 1}`}</Text>
                </View>
              ))}
            </View>
            
            {/* Table Rows */}
            {rows.map((row: any, rIndex: number) => (
                <View key={`row-${rIndex}`} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  {Array.isArray(row) 
                    ? row.map((cell, cIndex) => (
                        <View key={`cell-${rIndex}-${cIndex}`} style={{ flex: 1, padding: 8 }}>
                          <Text style={{ fontSize: 10 }}>{String(cell || '').trim() || '-'}</Text>
                        </View>
                      ))
                    : // Handle case where row is not an array
                      <View style={{ flex: 1, padding: 8 }}>
                        <Text style={{ fontSize: 10, color: '#6B7280', fontStyle: 'italic' }}>
                          Invalid row data
                        </Text>
                      </View>
                  }
              ))
          </View>
        );
      
      default:
        return (
          <Text style={styles.paragraph}>
            {typeof safeContent === 'string' 
              ? safeContent 
              : JSON.stringify(safeContent, null, 2)}
          </Text>
        );
    }
  };

  return (
    <Page key={index} size="A4" style={styles.page}>
      <View style={styles.section}>
        {section.title && (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        {renderContent()}
      </View>
      <Text style={styles.footer}>{new Date().getFullYear()} {brandName}</Text>
    </Page>
  );
};

// --- PDF DOCUMENT DEFINITION ---
const PDFDocument: React.FC<{ content: PDFContent; brandName: string }> = ({ content, brandName }) => {
  return (
    <Document>
      {/* Title Page */}
      <Page size="A4" style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ textAlign: 'center' }}>
          <Text style={styles.header}>{content.title_page.title}</Text>
          <Text style={styles.subheader}>{content.title_page.subtitle}</Text>
        </View>
        <Text style={styles.footer}>{new Date().getFullYear()} {brandName}</Text>
      </Page>

      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.introduction_page.title}</Text>
          <Text style={styles.paragraph}>{content.introduction_page.content}</Text>
        </View>
        <Text style={styles.footer}>{new Date().getFullYear()} {brandName}</Text>
      </Page>
      
      {/* Toolkit Sections */}
      {content.toolkit_sections.map((section, index) => (
        <React.Fragment key={`section-${index}`}>
          {renderPdfSection(section, index, brandName)}
        </React.Fragment>
      ))}
      
      {/* CTA Page */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, { flex: 1, justifyContent: 'center' }]}>
          <Text style={[styles.header, { textAlign: 'center', marginBottom: 20 }]}>
            {content.cta_page.title}
          </Text>
          <Text style={[styles.paragraph, { textAlign: 'center' }]}>
            {content.cta_page.content}
          </Text>
        </View>
        <Text style={styles.footer}>{new Date().getFullYear()} {brandName}</Text>
      </Page>
    </Document>
  );
};

// --- MAIN COMPONENT ---
const PDFGenerator: React.FC<PDFGeneratorProps> = ({ content, brandName, onDownload }) => {
  return (
    <div className="flex flex-col items-center">
      <PDFDownloadLink
        document={<PDFDocument content={content} brandName={brandName} />}
        fileName={`${brandName.replace(/\s+/g, '-').toLowerCase()}-strategy.pdf`}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        onClick={onDownload}
      >
        {({ loading }: { loading: boolean }) => (
          <>
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default PDFGenerator;
