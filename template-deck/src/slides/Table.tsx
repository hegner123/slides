export function Table() {
  const rows = [
    { label: "Row one", a: "Value A", b: "Value B", c: "Value C" },
    { label: "Row two", a: "Value A", b: "Value B", c: "Value C" },
    { label: "Row three", a: "Value A", b: "Value B", c: "Value C" },
    { label: "Row four", a: "Value A", b: "Value B", c: "Value C" },
  ];

  return (
    <div className="slide neutral">
      <h2 className="section-title">
        Comparison <span className="accent">Table</span>
      </h2>
      <table className="comparison-table">
        <thead>
          <tr>
            <th style={{ width: "20%" }}></th>
            <th>Column A</th>
            <th>Column B</th>
            <th>Column C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="row-label">{r.label}</td>
              <td>{r.a}</td>
              <td>{r.b}</td>
              <td>{r.c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
