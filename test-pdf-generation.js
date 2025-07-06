// Test script to verify PDF generation
const fs = require('fs');

// Sample structured content that the AI would generate
const sampleStructuredContent = {
  title_page: {
    layout: "centered",
    title: "The Ultimate Social Media Marketing Toolkit",
    subtitle: "A 3-Part Guide to Boost Your Online Presence and Drive Real Results."
  },
  introduction_page: {
    layout: "filled",
    title: "Why This Toolkit Will Transform Your Social Media Strategy",
    content: "Social media marketing can feel overwhelming with constantly changing algorithms, new platforms emerging, and the pressure to create engaging content consistently. Many businesses struggle with inconsistent posting, low engagement rates, and unclear ROI. This toolkit provides the specific, actionable resources—a comprehensive strategy framework, content planning templates, engagement scripts, and performance tracking tools—to help you build a sustainable, high-performing social media presence. Use these tools to create a systematic approach that delivers measurable results and grows your audience authentically."
  },
  toolkit_sections: [
    {
      layout: "filled",
      type: "pros_and_cons_list",
      title: "Section 1: Social Media Platform Analysis",
      content: {
        items: [
          {
            method_name: "Instagram",
            pros: "High visual engagement, strong influencer ecosystem, excellent for brand building and storytelling.",
            cons: "Algorithm changes frequently, requires high-quality visual content, limited link sharing capabilities."
          },
          {
            method_name: "LinkedIn",
            pros: "Professional audience, excellent for B2B marketing, high-quality leads, thought leadership opportunities.",
            cons: "Lower engagement rates, more formal tone required, slower content discovery."
          },
          {
            method_name: "TikTok",
            pros: "Viral potential, younger demographic, creative freedom, high engagement rates.",
            cons: "Requires video content, fast-paced trends, challenging for older demographics."
          },
          {
            method_name: "Twitter/X",
            pros: "Real-time conversations, excellent for customer service, easy content creation, strong hashtag culture.",
            cons: "Character limitations, fast content turnover, can be overwhelming with information overload."
          }
        ]
      }
    },
    {
      layout: "filled",
      type: "checklist",
      title: "Section 2: Content Strategy Implementation Checklist",
      content: {
        phases: [
          {
            phase_title: "Phase A: Strategy Foundation",
            items: [
              "1.1 Define your target audience and create detailed buyer personas",
              "1.2 Set specific, measurable social media goals and KPIs",
              "1.3 Conduct competitive analysis to identify content gaps and opportunities",
              "1.4 Choose 2-3 primary platforms based on your audience and content type"
            ]
          },
          {
            phase_title: "Phase B: Content Planning and Creation",
            items: [
              "2.1 Develop a content calendar with consistent posting schedule",
              "2.2 Create content pillars (3-5 main topics) that align with your brand",
              "2.3 Design visual brand guidelines and templates for consistency",
              "2.4 Plan a mix of content types: educational, entertaining, promotional, and user-generated"
            ]
          },
          {
            phase_title: "Phase C: Engagement and Optimization",
            items: [
              "3.1 Implement community management strategy with response templates",
              "3.2 Set up analytics tracking and regular performance reviews",
              "3.3 A/B test different content formats and posting times",
              "3.4 Develop influencer partnership strategy and outreach process"
            ]
          }
        ]
      }
    },
    {
      layout: "filled",
      type: "scripts",
      title: "Section 3: Customer Engagement Scripts",
      content: {
        scenarios: [
          {
            trigger: "Your post gets negative comments about your product quality.",
            response: "Thank you for bringing this to our attention. We take quality seriously and would love to understand your experience better. Could you DM us with more details so we can address this immediately?",
            explanation: "This acknowledges the concern, shows accountability, and moves the conversation to private channels to resolve the issue professionally."
          },
          {
            trigger: "Someone asks about pricing in the comments.",
            response: "Great question! Our pricing varies based on your specific needs. I'd be happy to send you our pricing guide and schedule a quick call to discuss your requirements. Would that work for you?",
            explanation: "This provides value while moving the conversation toward a sales opportunity without being pushy."
          },
          {
            trigger: "A competitor's customer complains about their service on your page.",
            response: "We understand how frustrating that can be. While we can't speak to other companies' services, we'd be happy to show you how we handle similar situations. Would you like to learn more about our approach?",
            explanation: "This shows empathy while professionally redirecting the conversation to your services without badmouthing competitors."
          }
        ]
      }
    }
  ],
  cta_page: {
    layout: "centered",
    title: "Your Next Step",
    content: "You now have the complete blueprint for implementing a successful social media strategy. To get a personalized assessment of how this blueprint can be applied to your specific business goals and audience, schedule a free 15-minute strategy session with our experts."
  }
};

// Test the content parsing logic
function testContentParsing() {
  console.log('=== Testing PDF Content Parsing ===');
  
  // Test 1: Structured content
  console.log('\n1. Testing structured content parsing...');
  try {
    const sections = parseStructuredContent(sampleStructuredContent);
    console.log(`✓ Parsed ${sections.length} sections from structured content`);
    sections.forEach((section, index) => {
      console.log(`  Section ${index + 1}: ${section.type} - ${section.title || 'No title'}`);
    });
  } catch (error) {
    console.error('✗ Error parsing structured content:', error.message);
  }
  
  // Test 2: String content
  console.log('\n2. Testing string content parsing...');
  try {
    const stringContent = JSON.stringify(sampleStructuredContent);
    const sections = parseContent(stringContent);
    console.log(`✓ Parsed ${sections.length} sections from string content`);
  } catch (error) {
    console.error('✗ Error parsing string content:', error.message);
  }
  
  // Test 3: Object content with structured_content
  console.log('\n3. Testing object content with structured_content...');
  try {
    const objectContent = {
      text: "Some text content",
      structured_content: sampleStructuredContent
    };
    const sections = parseContent(objectContent);
    console.log(`✓ Parsed ${sections.length} sections from object content`);
  } catch (error) {
    console.error('✗ Error parsing object content:', error.message);
  }
}

// Mock the parseStructuredContent function (this would be from the PDFGenerator component)
function parseStructuredContent(jsonContent) {
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
    jsonContent.toolkit_sections.forEach((section) => {
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
}

// Mock the formatStructuredSection function
function formatStructuredSection(section) {
  if (!section.content) return 'Content not available';
  
  switch (section.type) {
    case 'checklist':
      if (section.content.phases) {
        return section.content.phases.map((phase) => {
          const items = phase.items.map((item) => `• ${item}`).join('\n');
          return `${phase.phase_title}\n${items}`;
        }).join('\n\n');
      }
      break;
      
    case 'scripts':
      if (section.content.scenarios) {
        return section.content.scenarios.map((scenario, index) => {
          return `Scenario ${index + 1}:\nWhen they say: "${scenario.trigger}"\nYou say: "${scenario.response}"\nStrategy: ${scenario.explanation}`;
        }).join('\n\n');
      }
      break;
      
    case 'pros_and_cons_list':
      if (section.content.items) {
        return section.content.items.map((item, index) => {
          return `${index + 1}. ${item.method_name}\n\nPros: ${item.pros}\n\nCons: ${item.cons}`;
        }).join('\n\n');
      }
      break;
  }
  
  return JSON.stringify(section.content);
}

// Mock the parseContent function
function parseContent(content) {
  if (!content) return [{ type: 'paragraph', content: 'No content available' }];
  
  let contentString = '';
  
  // Handle different content types
  if (typeof content === 'string') {
    contentString = content;
  } else if (typeof content === 'object') {
    if (content.text) {
      contentString = content.text;
    } else if (content.content) {
      contentString = content.content;
    } else if (content.structured_content) {
      return parseStructuredContent(content.structured_content);
    } else {
      contentString = JSON.stringify(content);
    }
  } else {
    contentString = String(content);
  }
  
  // Try to parse as JSON first
  try {
    const jsonContent = JSON.parse(contentString);
    if (jsonContent.title_page && jsonContent.toolkit_sections) {
      return parseStructuredContent(jsonContent);
    }
  } catch (e) {
    // Not JSON, treat as plain text
  }
  
  // Split content into sections for plain text
  const sections = contentString
    .split(/\n\s*\n/)
    .map(section => section.trim())
    .filter(section => section.length > 0)
    .map(section => ({ type: 'paragraph', content: section }));
  
  if (sections.length === 0) {
    return [{ type: 'paragraph', content: contentString || 'No content available' }];
  }
  
  return sections;
}

// Run the tests
console.log('PDF Generation Test Suite');
console.log('========================');
testContentParsing();
console.log('\n=== Test Complete ===');
console.log('\nTo test the actual PDF generation:');
console.log('1. Start the development server: npm run dev');
console.log('2. Go to http://localhost:5176');
console.log('3. Complete the wizard to generate a campaign');
console.log('4. Submit an email to access the PDF download');
console.log('5. Click "Download PDF" to test the generation'); 