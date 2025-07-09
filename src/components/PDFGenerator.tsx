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

const PDFGenerator = () => (
  <Document
    author="Manish Bhanushali"
    title="The 3-Step Social Media Playbook"
  >
    {/* --- PAGE 1: Welcome --- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.h1}>The 3-Step Social Media Playbook</Text>
      <Text style={styles.subtitle}>
        How Solopreneurs Can Turn Followers into Clients—Without Marketing Burnout
      </Text>
      <Text style={styles.toolkitCredit}>A QuickStrat AI Toolkit</Text>
      <Text style={styles.p}>Hi there — I'm Manish, founder of QuickStrat.</Text>
      <Text style={styles.p}>If you're a solopreneur trying to grow your business online, you already know this: creating content is exhausting and leads are hard to come by.</Text>
      <Text style={styles.p}>That’s why I built QuickStrat—and this toolkit.</Text>
      <Text style={styles.p}>Inside, you'll find:</Text>
      <Text style={styles.welcomeList}>
        ✅  <Text style={{ fontWeight: 'bold' }}>Proven strategies</Text> (with no fluff)
      </Text>
      <Text style={styles.welcomeList}>
        ✅  A <Text style={{ fontWeight: 'bold' }}>plug-and-play checklist</Text> to stay consistent
      </Text>
      <Text style={styles.welcomeList}>
        ✅  <Text style={{ fontWeight: 'bold' }}>Word-for-word scripts</Text> to convert interest into income
      </Text>
      <Text style={styles.p}>You don't need a marketing degree. Just this 3-step playbook.</Text>
      <Text style={styles.p}>Let’s dive in.</Text>
    </Page>

    {/* --- PAGE 2: What You'll Learn --- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageHeader}>Step 1 of 3</Text>
      <Text style={styles.h2}>🚀 What You’ll Learn</Text>
      <Text style={styles.h3}>The 3-Step Lead Magnet System</Text>

      <View style={styles.learnContainer}>
        <View style={styles.learnItem}>
          <Text style={styles.learnIcon}>🧠</Text>
          <Text style={styles.learnHeading}>Pick Your Strategy</Text>
          <Text style={styles.p}>Understand what works (and what drains your time).</Text>
        </View>
        <View style={styles.learnItem}>
          <Text style={styles.learnIcon}>✅</Text>
          <Text style={styles.learnHeading}>Follow the Checklist</Text>
          <Text style={styles.p}>Nail the daily actions that drive results.</Text>
        </View>
        <View style={styles.learnItem}>
          <Text style={styles.learnIcon}>💬</Text>
          <Text style={styles.learnHeading}>Use Proven Scripts</Text>
          <Text style={styles.p}>Say the right thing when people show interest.</Text>
        </View>
      </View>
    </Page>

    {/* --- PAGE 3: Strategy Showdown --- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageHeader}>Step 1 of 3</Text>
      <Text style={styles.h2}>📊 Strategy Showdown: What Actually Works?</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Strategy</Text>
          <Text style={styles.tableHeaderCell}>Pros</Text>
          <Text style={styles.tableHeaderCell}>Cons</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellFirst]}>Paid Ads</Text>
          <Text style={styles.tableCell}>Fast results. Laser targeting.</Text>
          <Text style={styles.tableCell}>Expensive. Needs constant testing.</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowEven]}>
          <Text style={[styles.tableCell, styles.tableCellFirst]}>Organic Content</Text>
          <Text style={styles.tableCell}>Builds trust. Low cost.</Text>
          <Text style={styles.tableCell}>Takes time. Requires consistency.</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableCellFirst]}>Influencer Collabs</Text>
          <Text style={styles.tableCell}>Access to warm audiences.</Text>
          <Text style={styles.tableCell}>Can be pricey. Depends on reputation.</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowEven]}>
          <Text style={[styles.tableCell, styles.tableCellFirst]}>Community Building</Text>
          <Text style={styles.tableCell}>Loyal fans. Word-of-mouth gold.</Text>
          <Text style={styles.tableCell}>Slow to scale. High effort.</Text>
        </View>
      </View>
      <View style={styles.proTip}>
        <Text style={styles.p}>💡 <Text style={{ fontWeight: 'bold' }}>Pro Tip:</Text> Pick 1–2 strategies and go deep. Don’t spread yourself thin.</Text>
      </View>
    </Page>

    {/* --- PAGE 4: The Checklist --- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageHeader}>Step 2 of 3</Text>
      <Text style={styles.h2}>✅ The Social Media Checklist</Text>
      <Text style={styles.p}>Use this to stay consistent and intentional.</Text>
      <View style={styles.checklistContainer}>
        <Text style={styles.h3}>Phase A: Set Your Foundation</Text>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Define your ideal client</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Pick the platform they hang out on</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Set a clear goal (book calls, collect emails, etc.)</Text>
        </View>

        <Text style={styles.h3}>Phase B: Create and Connect</Text>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Optimize your bio and profile</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Post 3–5 times per week (value, proof, offers)</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Reply to every comment and DM</Text>
        </View>

        <Text style={styles.h3}>Phase C: Track and Tweak</Text>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Track likes, DMs, link clicks weekly</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Identify your top 3 posts</Text>
        </View>
        <View style={styles.checklistItem}>
          <Text style={styles.checkbox}>🔲</Text>
          <Text>Double down on what works</Text>
        </View>
      </View>
    </Page>

    {/* --- PAGE 5: Scripts --- */}
    <Page size="A4" style={styles.page}>
      <Text style={styles.pageHeader}>Step 3 of 3</Text>
      <Text style={styles.h2}>💬 Scripts That Turn Comments Into Clients</Text>
      
      <View style={styles.scriptBlock}>
        <Text style={styles.h3}>Scenario 1: “Tell me more about your service.”</Text>
        <Text style={styles.p}><Text style={{ fontWeight: 'bold' }}>You say:</Text></Text>
        <View style={styles.scriptDialog}>
          <Text>“Absolutely! I’d love to share more. Are you looking for help with [X] or [Y]? That’ll help me give you the most useful info.”</Text>
        </View>
        <View style={styles.scriptWhy}>
          <Text>✅ <Text style={{ fontWeight: 'bold' }}>Why it works:</Text> Gets them to self-identify and deepens the convo.</Text>
        </View>
      </View>

      <View style={styles.scriptBlock}>
        <Text style={styles.h3}>Scenario 2: “Your prices are too high.”</Text>
        <Text style={styles.p}><Text style={{ fontWeight: 'bold' }}>You say:</Text></Text>
        <View style={styles.scriptDialog}>
          <Text>“I get it—investing in your growth can feel big. But I make sure you get serious ROI. Want to see a few client results?”</Text>
        </View>
        <View style={styles.scriptWhy}>
          <Text>✅ <Text style={{ fontWeight: 'bold' }}>Why it works:</Text> Shifts focus from cost to value.</Text>
        </View>
      </View>

      <View style={styles.scriptBlock}>
        <Text style={styles.h3}>Scenario 3: “How soon will I see results?”</Text>
        <Text style={styles.p}><Text style={{ fontWeight: 'bold' }}>You say:</Text></Text>
        <View style={styles.scriptDialog}>
          <Text>“I’ve seen quick wins, but real growth compounds week by week. This isn’t just traffic—it’s strategy that sticks.”</Text>
        </View>
        <View style={styles.scriptWhy}>
          <Text>✅ <Text style={{ fontWeight: 'bold' }}>Why it works:</Text> Sets realistic expectations and positions you as a long-term partner.</Text>
        </View>
      </View>
    </Page>

    {/* --- PAGE 6: Call to Action --- */}
    <Page size="A4" style={styles.page}>
      <View style={styles.ctaBlock}>
        <Text style={styles.ctaHeading}>📞 Ready to Get Your Strategy Done For You?</Text>
        <Text style={styles.ctaText}>If you want this whole thing done in 30 minutes or less...</Text>
        
        <Link src="https://calendly.com/majorbeam" style={styles.ctaButton}>
          <Text>🎯 Book a free Strategy Session</Text>
        </Link>
        
        <Link src="https://quickstrat.app" style={styles.ctaButton}>
          <Text>🌐 Explore the tool</Text>
        </Link>

        <Text style={styles.ctaEmail}>
          📧 Questions? <Link src="mailto:manishbhanushali1101@gmail.com" style={styles.ctaEmailLink}>manishbhanushali1101@gmail.com</Link>
        </Text>
      </View>
    </Page>
  </Document>
);

export default PDFGenerator;
