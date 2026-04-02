export function Bullets() {
  return (
    <div className="slide problem">
      <h2 className="section-title">
        Bullet <span className="accent">List</span>
      </h2>
      <ul className="bullets">
        <li>
          First point with a <span className="label">label:</span> followed
          by supporting detail
        </li>
        <li>
          Second point with <code>inline code</code> for technical terms
        </li>
        <li>
          Third point with <strong>bold emphasis</strong> on key words
        </li>
        <li>
          Fourth point showing a longer explanation that wraps to multiple
          lines while maintaining readability
        </li>
      </ul>
    </div>
  );
}
