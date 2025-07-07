import React, { useState } from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  BlobProvider,
  Font,
  Image
} from '@react-pdf/renderer';
import { Download, FileText, Star, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

interface PDFGeneratorProps {
  content: string | any;
  brandName: string;
}

// Register fonts for better typography
// Use built-in fonts that are guaranteed to work
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
});

Font.register({
  family: 'Helvetica-Bold',
  src: 'Helvetica-Bold'
});

Font.register({
  family: 'Times-Roman',
  src: 'Times-Roman'
});

Font.register({
  family: 'Times-Bold',
  src: 'Times-Bold'
});

const styles = StyleSheet.create({
  // Page styles
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.6
  },
  
  // Header styles
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #3b82f6',
    paddingBottom: 20
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  
  logo: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  logoText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold'
  },
  
  headerInfo: {
    flex: 1,
    marginLeft: 20
  },
  
  documentTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 1.2
  },
  
  documentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5
  },
  
  documentMeta: {
    fontSize: 10,
    color: '#9ca3af'
  },
  
  // Content styles
  content: {
    flex: 1
  },
  
  section: {
    marginBottom: 25
  },
  
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #e5e7eb'
  },
  
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    marginTop: 15
  },
  
  paragraph: {
    fontSize: 12,
    lineHeight: 1.7,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'justify'
  },
  
  highlightBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: 6,
    padding: 15,
    marginVertical: 10
  },
  
  highlightTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 8
  },
  
  highlightText: {
    fontSize: 11,
    color: '#0c4a6e',
    lineHeight: 1.6
  },
  
  // List styles
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start'
  },
  
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 6,
    marginRight: 10
  },
  
  listText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151'
  },
  
  // Quote styles
  quoteBox: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: 15,
    marginVertical: 15,
    fontStyle: 'italic'
  },
  
  quoteText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 1.6,
    fontStyle: 'italic'
  },
  
  // Call to action styles
  ctaBox: {
    backgroundColor: '#ecfdf5',
    border: '2px solid #10b981',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    textAlign: 'center'
  },
  
  ctaTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 10
  },
  
  ctaText: {
    fontSize: 12,
    color: '#065f46',
    lineHeight: 1.6
  },
  
  // Footer styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb'
  },
  
  footerLeft: {
    fontSize: 10,
    color: '#6b7280'
  },
  
  footerRight: {
    fontSize: 10,
    color: '#6b7280'
  },
  
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 10,
    color: '#6b7280'
  }
});

// --- Bulletproof PDF Generator ---
// Handles all section types, page numbers, branding, and robust error handling.

// Helper: Render section content with uniform formatting
const renderSectionContent = (section: any) => {
  // String content: render as paragraph
  if (typeof section.content === 'string') {
    return <Text style={styles.paragraph}>{section.content}</Text>;
  }
  // Array content: render as list
  if (Array.isArray(section.content)) {
    return (
      <View>
        {section.content.map((item: any, idx: number) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  // Object content: flatten to list of strings for uniform rendering
  if (section.content && typeof section.content === 'object') {
    const items: string[] = [];
    if (section.content.items) {
      section.content.items.forEach((item: any) => {
        let str = '';
        if (item.method_name) str += `${item.method_name}\n`;
        if (item.pros) str += `Pros: ${item.pros}\n`;
        if (item.cons) str += `Cons: ${item.cons}`;
        items.push(str.trim());
      });
    } else if (section.content.phases) {
      section.content.phases.forEach((phase: any) => {
        items.push(`${phase.phase_title}\n${phase.items.map((i: string) => `• ${i}`).join('\n')}`);
      });
    } else if (section.content.scenarios) {
      section.content.scenarios.forEach((scenario: any, idx: number) => {
        items.push(`Scenario ${idx + 1}:\nWhen they say: "${scenario.trigger}"\nYou say: "${scenario.response}"\nStrategy: ${scenario.explanation}`);
      });
    }
    return (
      <View>
        {items.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  // Fallback
  return <Text style={styles.paragraph}>Content not available</Text>;
};

// Flexible parser: handles both structured_content and flat keys, never drops data
const parseContent = (jsonContent: any, brandName?: string): any[] => {
  let sections: any[] = [];
  // Always use structured_content if present
  const data = (jsonContent && typeof jsonContent === 'object' && jsonContent.structured_content)
    ? jsonContent.structured_content
    : jsonContent;

  // --- Structured Content Parsing ---
  if (data && typeof data === 'object' && data.title_page) {
    sections.push({
      type: 'title',
      title: data.title_page.title || (brandName ? `${brandName} Lead Magnet Guide` : 'Your Personalized Guide'),
      subtitle: data.title_page.subtitle || 'A step-by-step blueprint to help you achieve your goals',
    });
  }
  if (data && typeof data === 'object' && data.introduction_page) {
    sections.push({
      type: 'section',
      title: data.introduction_page.title || 'Introduction',
      content: data.introduction_page.content || '',
    });
  }
  if (data && typeof data === 'object' && data.toolkit_sections && Array.isArray(data.toolkit_sections)) {
    data.toolkit_sections.forEach((section: any) => {
      sections.push({
        type: section.type || 'section',
        title: section.title,
        content: section.content,
      });
    });
  }
  if (data && typeof data === 'object' && data.cta_page) {
    sections.push({
      type: 'cta',
      title: data.cta_page.title || 'Take the Next Step',
      content: data.cta_page.content,
    });
  }

  // --- Fallbacks if no structured_content ---
  if (sections.length === 0) {
    // Title Page (always add, even for string input)
    let title = brandName ? `${brandName} Lead Magnet Guide` : 'Your Personalized Guide';
    let subtitle = 'A step-by-step blueprint to help you achieve your goals';
    if (data && typeof data === 'object' && data.title) {
      title = data.title;
      if (data.subtitle) subtitle = data.subtitle;
    }
    sections.push({
      type: 'title',
      title,
      subtitle,
    });

    // Main Content Sections
    if (data && typeof data === 'object' && Array.isArray(data.sections)) {
      data.sections.forEach((section: any) => {
        sections.push({
          type: 'section',
          title: section.title,
          content: section.content,
        });
      });
    } else if (data && typeof data === 'object' && data.introduction) {
      sections.push({
        type: 'section',
        title: data.title || 'Main Content',
        content: data.introduction,
      });
    } else if (typeof data === 'string') {
      // Fallback: treat string as a single section
      sections.push({
        type: 'section',
        title: 'Main Content',
        content: data,
      });
    }

    // CTA Page (always add, even for string input)
    let ctaContent = data && typeof data === 'object' && data.cta_page && data.cta_page.content
      ? data.cta_page.content
      : `Ready to put these strategies into action? Schedule a free strategy session with our team or reach out to ${brandName || 'our experts'} for personalized support. Your success starts now!`;
    sections.push({
      type: 'cta',
      content: ctaContent,
    });
  }

  return sections;
};

// Main PDFDocument component
const PDFDocument: React.FC<{ content: any; brandName: string }> = ({ content, brandName }) => {
  const sections: any[] = parseContent(content, brandName);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Debug: See what is being rendered
  console.log('PDF SECTIONS:', sections);

  if (sections.length === 0) {
    // Professional error page if no valid content
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>{brandName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.documentTitle}>PDF Generation Error</Text>
              <Text style={styles.documentSubtitle}>Content Missing or Malformed</Text>
              <Text style={styles.documentMeta}>Created by {brandName} • {currentDate}</Text>
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              Sorry, this PDF could not be generated because the required content was missing or malformed. Please try again or contact support.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      {sections.map((section: any, idx: number) => (
        <Page key={idx} size="A4" style={styles.page}>
          {/* Header/Branding on every page */}
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>{brandName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.documentTitle}>{section.title}</Text>
              {section.subtitle && <Text style={styles.documentSubtitle}>{section.subtitle}</Text>}
              <Text style={styles.documentMeta}>Created by {brandName} • {currentDate}</Text>
            </View>
          </View>
          {/* Section Content */}
          <View style={styles.content}>
            {renderSectionContent(section)}
          </View>
          {/* Footer with page number and brand */}
          <View style={styles.footer} fixed>
            <Text style={styles.footerLeft}>© {new Date().getFullYear()} {brandName}</Text>
            <Text style={styles.footerRight}>Page {idx + 1}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ content, brandName }) => {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleDownload = (blob: Blob | null) => {
    console.log('PDF Download triggered:', { blob, brandName, contentLength: content?.length });
    
    if (!blob) {
      console.error('No blob provided for download');
      setError('Failed to generate PDF - no content available');
      return;
    }

    try {
      console.log('Creating download link for blob:', blob.size, 'bytes');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-professional-guide.pdf`;
      link.style.display = 'none';
      
      console.log('Triggering download with filename:', link.download);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setError(null);
      console.log('PDF download completed successfully');
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Debug content parsing
  React.useEffect(() => {
    if (content) {
      const sections: any[] = parseContent(content, brandName);
      setDebugInfo({
        sectionsCount: sections.length,
        sectionTypes: sections.map((s: any) => s.type),
        hasTitle: sections.some((s: any) => s.type === 'title'),
        hasSections: sections.some((s: any) => s.type === 'section'),
        hasCTA: sections.some((s: any) => s.type === 'cta'),
        contentPreview: typeof content === 'string' ? content.substring(0, 100) : 'Object content'
      });
      console.log('PDF Content Debug:', debugInfo);
    }
  }, [content, brandName]);

  console.log('PDFGenerator render:', { content: typeof content, brandName, contentPreview: content?.substring(0, 100) });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg mr-4">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Professional PDF Guide</h3>
            <p className="text-sm text-gray-600">High-quality, print-ready document</p>
          </div>
        </div>
        
        <BlobProvider document={<PDFDocument content={content} brandName={brandName} />}>
          {({ blob, url, loading, error: pdfError }) => {
            console.log('BlobProvider state:', { blob: !!blob, url, loading, error: pdfError });
            
            if (loading) {
              return (
                <button className="inline-flex items-center px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </button>
              );
            }
            
            if (pdfError) {
              console.error('PDF generation error:', pdfError);
              setError('Failed to generate PDF: ' + pdfError.message);
              return (
                <button className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg font-semibold cursor-not-allowed">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Error
                </button>
              );
            }
            
            if (!blob) {
              console.warn('No blob available for download');
              return (
                <button className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold cursor-not-allowed">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  No PDF Available
                </button>
              );
            }
            
            return (
              <button
                onClick={() => handleDownload(blob)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg cursor-pointer"
                title="Download PDF Guide"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            );
          }}
        </BlobProvider>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">PDF Debug Info</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Sections: {debugInfo.sectionsCount}</div>
            <div>Types: {debugInfo.sectionTypes.join(', ')}</div>
            <div>Has Title: {debugInfo.hasTitle ? 'Yes' : 'No'}</div>
            <div>Has Sections: {debugInfo.hasSections ? 'Yes' : 'No'}</div>
            <div>Has CTA: {debugInfo.hasCTA ? 'Yes' : 'No'}</div>
            <div>Content Type: {typeof content}</div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-900">Professional Design</h4>
          </div>
          <p className="text-sm text-blue-700">Clean typography, proper spacing, and modern layout</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-900">Print Ready</h4>
          </div>
          <p className="text-sm text-green-700">Optimized for both digital and print formats</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Document Preview</h4>
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {parseContent(content, brandName).slice(0, 3).map((section: any, index: number) => (
            <div key={index} className="p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-2">{section.content}</p>
            </div>
          ))}
          {parseContent(content, brandName).length > 3 && (
            <div className="text-center text-sm text-gray-500">
              +{parseContent(content, brandName).length - 3} more sections
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
