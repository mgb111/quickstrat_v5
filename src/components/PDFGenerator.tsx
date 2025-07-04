// Inside your PDFGenerator.tsx component...

{
  toolkit_sections.map((section, index) => {
    // Add a key for each section
    const key = `section-${index}`;

    // Logic for rendering the 'pros_and_cons_list'
    if (section.type === 'pros_and_cons_list') {
      return (
        <div key={key} className="page-section">
          <h2>{section.title}</h2>
          {section.content.items.map((item, itemIndex) => (
            <div key={item.method_name} className="method-item">
              <h3>{item.method_name}</h3>
              <h4>Pros:</h4>
              <ul>
                {item.pros.map((pro, proIndex) => <li key={proIndex}>{pro}</li>)}
              </ul>
              <h4>Cons:</h4>
              <ul>
                {item.cons.map((con, conIndex) => <li key={conIndex}>{con}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    // Updated logic for rendering the phased 'checklist'
    if (section.type === 'checklist') {
      return (
        <div key={key} className="page-section">
          <h2>{section.title}</h2>
          {section.content.phases.map((phase, phaseIndex) => (
            <div key={phase.phase_title} className="phase-item">
              <h4>{phase.phase_title}</h4>
              <ul>
                {phase.items.map((item, itemIndex) => <li key={itemIndex}>☐ {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    // Add similar logic for 'scripts', 'table', 'mistakes_to_avoid', etc.

    // Return null or a default case for unknown types
    return null;
  });
}