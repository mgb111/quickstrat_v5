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

// Register custom fonts for better typography - using fallback fonts
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
});

Font.register({
  family: 'Inter-Bold',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
  fontWeight: 'bold'
});

// Fallback font registration
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
});

Font.register({
  family: 'Helvetica-Bold',
  src: 'Helvetica-Bold'
});

const styles = StyleSheet.create({
  // Page styles
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter, Helvetica',
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
    fontFamily: 'Inter-Bold, Helvetica-Bold',
    fontWeight: 'bold'
  },
  
  headerInfo: {
    flex: 1,
    marginLeft: 20
  },
  
  documentTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold, Helvetica-Bold',
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
    fontFamily: 'Inter-Bold, Helvetica-Bold',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #e5e7eb'
  },
  
  sectionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold, Helvetica-Bold',
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
    fontFamily: 'Inter-Bold, Helvetica-Bold',
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
    fontFamily: 'Inter-Bold, Helvetica-Bold',
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

// Improved content parsing function that handles structured content better
const parseContent = (content: string | any): any[] => {
  if (!content) return [{ type: 'paragraph', content: 'No content available' }];
  
  let contentString = '';
  
  // Handle different content types
  if (typeof content === 'string') {
    contentString = content;
  } else if (typeof content === 'object') {
    // If it's an object, try to extract text content
    if (content.text) {
      contentString = content.text;
    } else if (content.content) {
      contentString = content.content;
    } else if (content.structured_content) {
      // Handle structured content from AI
      console.log('Detected structured content from AI');
      return parseStructuredContent(content.structured_content);
    } else {
      contentString = JSON.stringify(content);
    }
  } else {
    contentString = String(content);
  }
  
  console.log('Parsing PDF content:', { 
    contentLength: contentString.length, 
    preview: contentString.substring(0, 200) 
  });
  
  // Try to parse as JSON first (in case it's structured content)
  try {
    const jsonContent = JSON.parse(contentString);
    if (jsonContent.title_page && jsonContent.toolkit_sections) {
      console.log('Detected structured JSON content');
      return parseStructuredContent(jsonContent);
    }
  } catch (e) {
    console.log('Content is not JSON, treating as plain text');
  }
  
  // Split content into sections for plain text
  const sections = contentString
    .split(/\n\s*\n/) // Split by double newlines
    .map(section => section.trim())
    .filter(section => section.length > 0)
    .map(section => ({ type: 'paragraph', content: section }));
  
  // If no sections found, create one from the whole content
  if (sections.length === 0) {
    return [{ type: 'paragraph', content: contentString || 'No content available' }];
  }
  
  return sections;
};

// Parse structured content from AI
const parseStructuredContent = (jsonContent: any): any[] => {
  const sections = [];
  
  // Add title page
  if (jsonContent.title_page) {
    sections.push({
      type: 'title',
      title: jsonContent.title_page.title,
      subtitle: jsonContent.title_page.subtitle
    });
  }
  
  // Add introduction
  if (jsonContent.introduction_page) {
    sections.push({
      type: 'section',
      title: jsonContent.introduction_page.title,
      content: jsonContent.introduction_page.content
    });
  }
  
  // Add toolkit sections
  if (jsonContent.toolkit_sections && Array.isArray(jsonContent.toolkit_sections)) {
    jsonContent.toolkit_sections.forEach((section: any) => {
      sections.push({
        type: 'section',
        title: section.title,
        content: formatStructuredSection(section)
      });
    });
  }
  
  // Add CTA
  if (jsonContent.cta_page) {
    sections.push({
      type: 'cta',
      title: jsonContent.cta_page.title,
      content: jsonContent.cta_page.content
    });
  }
  
  return sections;
};

// Format structured section content
const formatStructuredSection = (section: any): string => {
  if (!section.content) return 'Content not available';
  
  switch (section.type) {
    case 'checklist':
      if (section.content.phases) {
        return section.content.phases.map((phase: any) => {
          const items = phase.items.map((item: string) => `• ${item}`).join('\n');
          return `${phase.phase_title}\n${items}`;
        }).join('\n\n');
      }
      break;
      
    case 'scripts':
      if (section.content.scenarios) {
        return section.content.scenarios.map((scenario: any, index: number) => {
          return `Scenario ${index + 1}:\nWhen they say: "${scenario.trigger}"\nYou say: "${scenario.response}"\nStrategy: ${scenario.explanation}`;
        }).join('\n\n');
      }
      break;
      
    case 'pros_and_cons_list':
      if (section.content.items) {
        return section.content.items.map((item: any, index: number) => {
          return `${index + 1}. ${item.method_name}\n\nPros: ${item.pros}\n\nCons: ${item.cons}`;
        }).join('\n\n');
      }
      break;
      
    case 'mistakes_to_avoid':
      if (section.content.mistakes) {
        return section.content.mistakes.map((mistake: any, index: number) => {
          return `${index + 1}. The Mistake: ${mistake.mistake}\nThe Solution: ${mistake.solution}`;
        }).join('\n\n');
      }
      break;
  }
  
  return JSON.stringify(section.content);
};

// Improved content formatting
const formatContent = (text: string) => {
  const trimmedText = text.trim();
  
  // Check if it's a quote
  if (trimmedText.startsWith('"') && trimmedText.endsWith('"')) {
    return { type: 'quote', content: trimmedText.slice(1, -1) };
  }
  
  // Check if it's a list item
  if (trimmedText.startsWith('•') || trimmedText.startsWith('-') || trimmedText.startsWith('*')) {
    return { type: 'list', content: trimmedText.slice(1).trim() };
  }
  
  // Check if it's a heading
  if (trimmedText.length < 100 && trimmedText.endsWith(':')) {
    return { type: 'heading', content: trimmedText };
  }
  
  // Check if it's a call to action
  if (trimmedText.toLowerCase().includes('call') || trimmedText.toLowerCase().includes('action') || trimmedText.toLowerCase().includes('next step')) {
    return { type: 'cta', content: trimmedText };
  }
  
  return { type: 'paragraph', content: trimmedText };
};

const PDFDocument: React.FC<{ content: string; brandName: string }> = ({ content, brandName }) => {
  const sections = parseContent(content);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  console.log('PDF Document sections:', sections.length);

  return (
    <Document>
      {/* Title Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>{brandName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.documentTitle}>
                {sections.find(s => s.type === 'title')?.title || 'Professional Guide'}
              </Text>
              <Text style={styles.documentSubtitle}>
                {sections.find(s => s.type === 'title')?.subtitle || 'A comprehensive guide to help you succeed'}
              </Text>
              <Text style={styles.documentMeta}>
                Created by {brandName} • {currentDate}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>What You'll Learn</Text>
            <Text style={styles.highlightText}>
              This comprehensive guide will walk you through proven strategies and actionable steps to achieve your goals. 
              Each section is designed to provide you with practical insights you can implement immediately.
            </Text>
          </View>
        </View>
        
        <Text style={styles.pageNumber}>1</Text>
      </Page>

      {/* Content Pages */}
      {sections.filter(s => s.type === 'section' || s.type === 'paragraph').map((section: any, index: number) => {
        return (
          <Page key={index} size="A4" style={styles.page}>
            <View style={styles.content}>
              {section.title && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
              )}
              
              {section.content && (
                <Text style={styles.paragraph}>{section.content}</Text>
              )}
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerLeft}>© {new Date().getFullYear()} {brandName}</Text>
              <Text style={styles.footerRight}>Page {index + 2}</Text>
            </View>
          </Page>
        );
      })}

      {/* CTA Page */}
      {sections.find(s => s.type === 'cta') && (
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <View style={styles.ctaBox}>
              <Text style={styles.ctaTitle}>
                {sections.find(s => s.type === 'cta')?.title || 'Ready to Take Action?'}
              </Text>
              <Text style={styles.ctaText}>
                {sections.find(s => s.type === 'cta')?.content || 'You now have all the tools and knowledge you need to succeed.'}
              </Text>
            </View>
            
            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>Key Takeaways</Text>
              <Text style={styles.highlightText}>
                • Review this guide regularly to reinforce key concepts{'\n'}
                • Start with small, manageable steps{'\n'}
                • Track your progress and celebrate wins{'\n'}
                • Don't hesitate to reach out for support
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerLeft}>© {new Date().getFullYear()} {brandName}</Text>
            <Text style={styles.footerRight}>Thank you for reading!</Text>
          </View>
        </Page>
      )}
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
      const sections = parseContent(content);
      setDebugInfo({
        sectionsCount: sections.length,
        sectionTypes: sections.map(s => s.type),
        hasTitle: sections.some(s => s.type === 'title'),
        hasSections: sections.some(s => s.type === 'section'),
        hasCTA: sections.some(s => s.type === 'cta'),
        contentPreview: typeof content === 'string' ? content.substring(0, 100) : 'Object content'
      });
      console.log('PDF Content Debug:', debugInfo);
    }
  }, [content]);

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
          {parseContent(content).slice(0, 3).map((section: any, index: number) => (
            <div key={index} className="p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700 line-clamp-2">{section.content}</p>
            </div>
          ))}
          {parseContent(content).length > 3 && (
            <div className="text-center text-sm text-gray-500">
              +{parseContent(content).length - 3} more sections
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
