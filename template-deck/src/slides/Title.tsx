export function Title() {
  return (
    <div className="slide intro">
      <h1 className="slide-title">Deck Title</h1>
      <p className="slide-subtitle">Subtitle goes here</p>
      <div style={{ marginTop: 32, color: "var(--muted)", fontSize: "0.9rem" }}>
        <p>Additional context line</p>
      </div>
    </div>
  );
}
