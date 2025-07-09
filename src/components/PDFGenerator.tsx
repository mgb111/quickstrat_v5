import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Link,
  Image,
} from '@react-pdf/renderer';
import { PDFContent } from '../types';

// --- Register Fonts ---
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZs.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZs.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZs.ttf', fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: '25mm',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    color: '#333',
  },
  pageHeader: {
    position: 'absolute',
    top: '20mm',
    right: '25mm',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
  },
  h1: {
    fontSize: 38,
    fontWeight: 900,
    color: '#1a237e',
    marginBottom: 10,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283593',
    borderBottomWidth: 2,
    borderBottomColor: '#5c6bc0',
    paddingBottom: 8,
    marginBottom: 20,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 10,
  },
  p: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 20,
  },
  toolkitCredit: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#7986cb',
    marginBottom: 30,
  },
  welcomeList: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    paddingLeft: 10,
  },
  learnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  learnItem: {
    flex: 1,
    padding: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
  },
  learnIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  learnHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: {
    width: '100%',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3f51b5',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    padding: 10,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRowEven: {
    backgroundColor: '#f4f6f8',
  },
  tableCell: {
    padding: 10,
    fontSize: 10,
    flex: 1,
  },
  tableCellFirst: {
    fontWeight: 'bold',
  },
  proTip: {
    backgroundColor: '#e8eaf6',
    borderLeftWidth: 4,
    borderLeftColor: '#7986cb',
    padding: 15,
    marginTop: 30,
  },
  checklistContainer: {
    backgroundColor: '#f7f9fc',
    padding: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbe2ef',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 12,
  },
  checkbox: {
    fontSize: 18,
    marginRight: 10,
    color: '#3f51b5',
  },
  scriptBlock: {
    marginBottom: 30,
  },
  scriptDialog: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    padding: 15,
    fontStyle: 'italic',
    fontSize: 11,
  },
  scriptWhy: {
    backgroundColor: '#f1f8e9',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8bc34a',
    fontSize: 10,
  },
  ctaBlock: {
    backgroundColor: '#1a237e',
    color: 'white',
    textAlign: 'center',
    padding: 40,
    borderRadius: 12,
    marginTop: 50,
  },
  ctaHeading: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ctaText: {
    color: '#c5cae9',
    fontSize: 11,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#448aff',
    color: 'white',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
  },
  ctaEmail: {
    marginTop: 20,
    fontSize: 11,
    color: '#c5cae9',
  },
  ctaEmailLink: {
    color: '#9fa8da',
    textDecoration: 'none',
  },
});

interface PDFGeneratorProps {
  data: PDFContent;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  const content = data.structured_content;

  // --- PAGE 1: Welcome ---
  const title = content?.title_page?.title || 'Lead Magnet Title';
  const subtitle = content?.title_page?.subtitle || '';
  const toolkitCredit = 'A QuickStrat AI Toolkit';
  const introTitle = content?.introduction_page?.title || '';
  const introContent = content?.introduction_page?.content || '';

  // --- Toolkit Sections ---
  const toolkitSections = content?.toolkit_sections || [];
  const checklistSection = toolkitSections.find(s => s.type === 'checklist');
  const prosConsSection = toolkitSections.find(s => s.type === 'pros_and_cons_list');
  const scriptsSection = toolkitSections.find(s => s.type === 'scripts');

  // --- CTA ---
  const ctaTitle = content?.cta_page?.title || '';
  const ctaContent = content?.cta_page?.content || '';
  const bookingLink = data.bookingLink || '';
  const website = data.website || '';
  const supportEmail = data.supportEmail || '';

  return (
    <Document author="QuickStrat" title={title}>
      {/* --- PAGE 1: Welcome --- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.toolkitCredit}>{toolkitCredit}</Text>
        <Text style={styles.p}>{introTitle}</Text>
        {introContent.split('\n').map((line, i) => (
          <Text key={i} style={styles.p}>{line}</Text>
        ))}
      </Page>

      {/* --- PAGE 2: What You'll Learn (Toolkit Overview) --- */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageHeader}>Step 1 of 3</Text>
        <Text style={styles.h2}>🚀 What You’ll Learn</Text>
        <Text style={styles.h3}>The 3-Step Lead Magnet System</Text>
        <View style={styles.learnContainer}>
          {toolkitSections.map((section, idx) => (
            <View key={idx} style={styles.learnItem}>
              <Text style={styles.learnIcon}>
                {section.type === 'pros_and_cons_list' ? '🧠' : section.type === 'checklist' ? '✅' : section.type === 'scripts' ? '💬' : '📄'}
              </Text>
              <Text style={styles.learnHeading}>{section.title}</Text>
              <Text style={styles.p}>{typeof section.content === 'string' ? section.content : ''}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* --- PAGE 3: Strategy Showdown (Pros & Cons) --- */}
      {prosConsSection && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageHeader}>Step 1 of 3</Text>
          <Text style={styles.h2}>📊 {prosConsSection.title}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Strategy</Text>
              <Text style={styles.tableHeaderCell}>Pros</Text>
              <Text style={styles.tableHeaderCell}>Cons</Text>
            </View>
            {Array.isArray((prosConsSection.content as any)?.items) && (prosConsSection.content as any).items.map((item: any, idx: number) => (
              <View key={idx} style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowEven] : styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellFirst]}>{item.method_name}</Text>
                <Text style={styles.tableCell}>{item.pros}</Text>
                <Text style={styles.tableCell}>{item.cons}</Text>
              </View>
            ))}
          </View>
          {(prosConsSection.content as any)?.example && (
            <View style={styles.proTip}>
              <Text style={styles.p}>💡 <Text style={{ fontWeight: 'bold' }}>Pro Tip:</Text> {(prosConsSection.content as any).example}</Text>
            </View>
          )}
        </Page>
      )}

      {/* --- PAGE 4: Checklist --- */}
      {checklistSection && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageHeader}>Step 2 of 3</Text>
          <Text style={styles.h2}>✅ {checklistSection.title}</Text>
          <Text style={styles.p}>{typeof checklistSection.content === 'string' ? checklistSection.content : ''}</Text>
          <View style={styles.checklistContainer}>
            {Array.isArray((checklistSection.content as any)?.phases) && (checklistSection.content as any).phases.map((phase: any, idx: number) => (
              <React.Fragment key={idx}>
                <Text style={styles.h3}>{phase.phase_title}</Text>
                {phase.items.map((item: string, i: number) => (
                  <View key={i} style={styles.checklistItem}>
                    <Text style={styles.checkbox}>🔲</Text>
                    <Text>{item}</Text>
                  </View>
                ))}
              </React.Fragment>
            ))}
          </View>
        </Page>
      )}

      {/* --- PAGE 5: Scripts --- */}
      {scriptsSection && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageHeader}>Step 3 of 3</Text>
          <Text style={styles.h2}>💬 {scriptsSection.title}</Text>
          {Array.isArray((scriptsSection.content as any)?.scenarios) && (scriptsSection.content as any).scenarios.map((scenario: any, idx: number) => (
            <View key={idx} style={styles.scriptBlock}>
              <Text style={styles.h3}>Scenario {idx + 1}: {scenario.trigger}</Text>
              <Text style={styles.p}><Text style={{ fontWeight: 'bold' }}>You say:</Text></Text>
              <View style={styles.scriptDialog}>
                <Text>{scenario.response}</Text>
              </View>
              <View style={styles.scriptWhy}>
                <Text>✅ <Text style={{ fontWeight: 'bold' }}>Why it works:</Text> {scenario.explanation}</Text>
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* --- PAGE 6: Call to Action --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.ctaBlock}>
          <Text style={styles.ctaHeading}>{ctaTitle}</Text>
          <Text style={styles.ctaText}>{ctaContent}</Text>
          {bookingLink && (
            <Link src={bookingLink} style={styles.ctaButton}>
              <Text>🎯 Book a free Strategy Session</Text>
            </Link>
          )}
          {website && (
            <Link src={website} style={styles.ctaButton}>
              <Text>🌐 Explore the tool</Text>
            </Link>
          )}
          {supportEmail && (
            <Text style={styles.ctaEmail}>
              📧 Questions? <Link src={`mailto:${supportEmail}`} style={styles.ctaEmailLink}>{supportEmail}</Link>
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PDFGenerator;
