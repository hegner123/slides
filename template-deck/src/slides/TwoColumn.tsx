export function TwoColumn() {
  return (
    <div className="slide neutral">
      <h2 className="section-title">
        Two <span className="accent">Column</span> Layout
      </h2>
      <div className="two-col">
        <div className="col-card go">
          <h3>Option A</h3>
          <ul>
            <li>First advantage</li>
            <li>Second advantage</li>
            <li>Third advantage</li>
          </ul>
        </div>
        <div className="col-card dotnet">
          <h3>Option B</h3>
          <ul>
            <li>First advantage</li>
            <li>Second advantage</li>
            <li>Third advantage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
