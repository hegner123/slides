export function Phases() {
  return (
    <div className="slide neutral">
      <h2 className="section-title">
        <span className="accent">Phase</span> Cards
      </h2>
      <div className="adoption-grid">
        <div className="phase-card active-phase">
          <div className="phase-label">Phase 1</div>
          <div className="phase-title">Active Phase</div>
          <div className="phase-detail">
            <p>Description of what happens in this phase. The active-phase
              class gives it a teal border highlight.</p>
            <p className="phase-outcome">Key outcome of this phase.</p>
          </div>
        </div>
        <div className="phase-card">
          <div className="phase-label">Phase 2</div>
          <div className="phase-title">Regular Phase</div>
          <div className="phase-detail">
            <p>Description of what happens in this phase. Standard card
              without the highlight.</p>
            <p className="phase-outcome">Key outcome.</p>
          </div>
        </div>
        <div className="phase-card">
          <div className="phase-label">Phase 3</div>
          <div className="phase-title">Another Phase</div>
          <div className="phase-detail">
            <p>These cards work in a 2-column grid. Odd numbers leave the
              last card spanning one column.</p>
          </div>
        </div>
        <div className="phase-card">
          <div className="phase-label">Phase 4</div>
          <div className="phase-title">Final Phase</div>
          <div className="phase-detail">
            <p>Last phase in the sequence.</p>
          </div>
        </div>
        <div className="phase-safety">
          <span className="safety-label">Note</span>
          <span className="safety-text">
            Full-width callout bar at the bottom of the grid.
          </span>
        </div>
      </div>
    </div>
  );
}
