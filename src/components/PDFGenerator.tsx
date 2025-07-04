import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { PDFContent, ToolkitSection } from '../types'; // Assuming ToolkitSection is part of your types

interface PDFGeneratorProps {
  content: PDFContent;
  brandName: string;
}

// --- STYLES FOR THE PDF DOCUMENT ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  titlePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827', // Darker gray
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4B5563', // Medium gray
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E40AF', // Darker blue
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
  },
  h4: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#1F2937',
  },
  ul: {
    paddingLeft: 15,
  },
  li: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 4,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9,
  },
});

// --- HELPER COMPONENT TO RENDER STRUCTURED PDF CONTENT ---
// This is the core fix: It intelligently renders different section types.
const renderPdfSection = (section: ToolkitSection, index: number) => {
  const { type, title, content } = section;

  return (
    <Page key={index} size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {(() => {
          switch (type) {
            case 'checklist':
              return (
                <View>
                  {content.phases.map((phase, pIndex) => (
                    <View key={pIndex} style={{ marginBottom: 10 }}>
                      <Text style={styles.h4}>{phase.phase_title}</Text>
                      <View style={styles.ul}>
                        {phase.items.map((item, iIndex) => (
                          <Text key={iIndex} style={styles.li}>• {item}</Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              );
            case 'pros_and_cons_list':
              return (
                <View>
                  {content.items.map((item, iIndex) => (
                    <View key={iIndex} style={{ marginBottom: 10 }}>
                      <Text style={styles.h4}>{item.method_name}</Text>
                      <Text style={{...styles.paragraph, fontWeight: 'bold'}}>Pros:</Text>
                      <View style={styles.ul}>
                         {item.pros.map((pro, pIndex) => <Text key={pIndex} style={styles.li}>• {pro}</Text>)}
                      </View>
                      <Text style={{...styles.paragraph, fontWeight: 'bold', marginTop: 5}}>Cons:</Text>
                       <View style={styles.ul}>
                         {item.cons.map((con, cIndex) => <Text key={cIndex} style={styles.li}>• {con}</Text>)}
                      </View>
                    </View>
                  ))}
                </View>
              );
            case 'scripts':
                 return (
                    <View>
                        {content.scenarios.map((scenario, sIndex) => (
                            <View key={sIndex} style={{ marginBottom: 15 }}>
                                <Text style={styles.h4}>Scenario: {scenario.trigger}</Text>
                                <Text style={styles.paragraph}><Text style={{fontWeight: 'bold'}}>Your Response:</Text> {scenario.response}</Text>
                                <Text style={styles.paragraph}><Text style={{fontWeight: 'bold'}}>Strategy:</Text> {scenario.explanation}</Text>
                            </View>
                        ))}
                    </View>
                 );
            default:
              // Fallback for simple text content
              return <Text style={styles.paragraph}>{content}</Text>;
          }
        })()}
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
  );
};

// --- PDF DOCUMENT DEFINITION ---
const PDFDocument: React.FC<{ content: PDFContent; brandName: string }> = ({ content, brandName }) => (
  <Document>
    {/* Title Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.titlePage}>
        <Text style={styles.title}>{content.title_page.title}</Text>
        <Text style={styles.subtitle}>{content.title_page.subtitle}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
    
    {/* Introduction Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{content.introduction_page.title}</Text>
        <Text style={styles.paragraph}>{content.introduction_page.content}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
    
    {/* Toolkit Sections - Mapped using the new renderer */}
    {content.toolkit_sections.map((section, index) => renderPdfSection(section, index))}
    
    {/* CTA Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.titlePage}>
        <Text style={styles.sectionTitle}>{content.cta_page.title}</Text>
        <Text style={styles.paragraph}>{content.cta_page.content}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
  </Document>
);


// --- MAIN COMPONENT TO RENDER THE HTML PREVIEW ---
// This also needs to be updated to render the structured content correctly.
const PDFGenerator: React.FC<PDFGeneratorProps> = ({ content, brandName }) => {
  // Helper function to render structured content as HTML
  const renderHtmlSection = (section: ToolkitSection) => {
    switch (section.type) {
      case 'checklist':
        return (
          <div>
            {section.content.phases.map((phase, pIndex) => (
              <div key={pIndex} className="mb-4">
                <h5 className="font-semibold text-gray-800">{phase.phase_title}</h5>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {phase.items.map((item, iIndex) => <li key={iIndex}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'pros_and_cons_list':
         return (
          <div>
            {section.content.items.map((item, iIndex) => (
              <div key={iIndex} className="mb-4">
                <h5 className="font-semibold text-gray-800">{item.method_name}</h5>
                <p className="text-sm font-bold mt-2">Pros:</p>
                <ul className="list-disc list-inside text-sm">
                   {item.pros.map((pro, pIndex) => <li key={pIndex}>{pro}</li>)}
                </ul>
                <p className="text-sm font-bold mt-2">Cons:</p>
                 <ul className="list-disc list-inside text-sm">
                   {item.cons.map((con, cIndex) => <li key={cIndex}>{con}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
       case 'scripts':
         return (
            <div>
                {section.content.scenarios.map((scenario, sIndex) => (
                    <div key={sIndex} className="mb-4">
                        <h5 className="font-semibold text-gray-800">Scenario: {scenario.trigger}</h5>
                        <p className="text-sm mt-1"><span className="font-bold">Your Response:</span> {scenario.response}</p>
                        <p className="text-xs italic text-gray-600 mt-1"><span className="font-bold">Strategy:</span> {scenario.explanation}</p>
                    </div>
                ))}
            </div>
         );
      default:
        // Fallback for simple text content
        return <p className="text-sm text-gray-700">{section.content}</p>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Your Lead Magnet PDF</h3>
        <PDFDownloadLink
          document={<PDFDocument content={content} brandName={brandName} />}
          fileName={`${brandName.replace(/\s+/g, '-').toLowerCase()}-lead-magnet.pdf`}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </PDFDownloadLink>
      </div>
      
      {/* HTML Preview Section */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{content.title_page.title}</h4>
          <p className="text-sm text-gray-700">{content.title_page.subtitle}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{content.introduction_page.title}</h4>
          <p className="text-sm text-gray-700">{content.introduction_page.content}</p>
        </div>
        
        {content.toolkit_sections.map((section, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
            {/* Use the new HTML renderer here */}
            {renderHtmlSection(section)}
          </div>
        ))}
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">{content.cta_page.title}</h4>
          <p className="text-sm text-gray-700">{content.cta_page.content}</p>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;