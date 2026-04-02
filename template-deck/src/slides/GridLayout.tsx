export function GridLayout() {
  return (
    <div className="slide go-section">
      <h2 className="section-title">
        <span className="accent">Grid</span> Layout
      </h2>
      <div className="go-grid">
        <div className="go-tech">
          <h3 className="grid-heading">Left Column (spans 2 rows)</h3>
          <div className="tech-compact">
            <div className="tech-row">
              <span className="tech-name">Item One</span>
              <span className="tech-desc">
                Description of the first item with enough detail to explain
                what it does and why it matters.
              </span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Item Two</span>
              <span className="tech-desc">
                Description of the second item.
              </span>
            </div>
          </div>
        </div>

        <div className="go-service">
          <h3 className="grid-heading">Top Right</h3>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-value">42</span>
              <span className="stat-label">metric label</span>
            </div>
            <div className="stat">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">another metric</span>
            </div>
          </div>
          <div className="stack-list">
            <span className="stack-tag">tag-one</span>
            <span className="stack-tag">tag-two</span>
            <span className="stack-tag">tag-three</span>
          </div>
        </div>

        <div className="go-deploy">
          <h3 className="grid-heading">Bottom Right</h3>
          <div className="deploy-details">
            <p>
              <span className="label">Label:</span> Detail text here
            </p>
            <p>
              <span className="label">Another:</span> More detail text
            </p>
          </div>
          <div className="cost-callout">
            <span className="amount">$X/mo</span> cost context
            <div className="note">Footnote or qualifier</div>
          </div>
        </div>
      </div>
    </div>
  );
}
