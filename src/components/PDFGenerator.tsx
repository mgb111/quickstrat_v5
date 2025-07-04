import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { PDFContent } from '../types';

interface PDFGeneratorProps {
  content: PDFContent;
  brandName: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  titlePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 1.5
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3b82f6'
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#374151',
    marginBottom: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10
  }
});

const PDFDocument: React.FC<{ content: PDFContent; brandName: string }> = ({ content, brandName }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.titlePage}>
        <Text style={styles.title}>{content.title}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
    
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Introduction</Text>
        <Text style={styles.paragraph}>{content.introduction}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
    
    {content.sections.map((section, index) => (
      <Page key={index} size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.paragraph}>{section.content}</Text>
        </View>
        <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
      </Page>
    ))}
    
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Steps</Text>
        <Text style={styles.paragraph}>{content.cta}</Text>
      </View>
      <Text style={styles.footer}>© {new Date().getFullYear()} {brandName}</Text>
    </Page>
  </Document>
);

case 'pros_and_cons_list':
  return (
    <div key={section.title} className="page-section">
      <h3>{section.title}</h3>
      {section.content.items.map((item, itemIndex) => (
        <div key={itemIndex} className="method-item" style={{ marginBottom: '15px' }}>
          <h4>{item.method_name}</h4>
          <p style={{ fontWeight: 'bold', marginTop: '5px' }}>Pros:</p>
          <ul>
            {item.pros.map((pro, proIndex) => <li key={proIndex}>{pro}</li>)}
          </ul>
          <p style={{ fontWeight: 'bold', marginTop: '5px' }}>Cons:</p>
          <ul>
            {item.cons.map((con, conIndex) => <li key={conIndex}>{con}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ content, brandName }) => {
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
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Title</h4>
          <p className="text-sm text-gray-700">{content.title}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Introduction</h4>
          <p className="text-sm text-gray-700">{content.introduction}</p>
        </div>
        
        {content.sections.map((section, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
            <p className="text-sm text-gray-700">{section.content}</p>
          </div>
        ))}
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Call to Action</h4>
          <p className="text-sm text-gray-700">{content.cta}</p>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;