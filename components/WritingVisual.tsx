"use client";

import type { Visual } from "@/data/writing";
import { BarChart, LineChart } from "./Charts";

export function visualSummary(v: Visual): string {
  switch (v.type) {
    case "bar":
      return `${v.title}. Categories: ${v.categories.join(", ")}. ` + v.series.map((s) => `${s.name}: ${s.values.join(", ")}`).join("; ");
    case "line":
      return `${v.title}. Years: ${v.xLabels.join(", ")}. ` + v.series.map((s) => `${s.name}: ${s.values.join(", ")}`).join("; ");
    case "table":
      return `${v.title}. ${v.headers.join(" | ")}. ` + v.rows.map((r) => r.join(" | ")).join("; ");
    case "process":
      return `${v.title}. Steps: ${v.steps.map((s, i) => `${i + 1}) ${s}`).join(" ")}`;
    case "map":
      return `${v.title}. ${v.before.label}: ${v.before.items.join("; ")}. ${v.after.label}: ${v.after.items.join("; ")}`;
  }
}

export default function WritingVisual({ v }: { v: Visual }) {
  return (
    <figure className="card" style={{ margin: "0 0 1rem" }}>
      <figcaption className="small en" style={{ fontWeight: 600, marginBottom: 6 }}>{v.title}</figcaption>
      {v.type === "bar" && <BarChart title={v.title} categories={v.categories} series={v.series} unit={v.unit} />}
      {v.type === "line" && <LineChart title={v.title} labels={v.xLabels} series={v.series} />}
      {v.type === "table" && (
        <div className="table-wrap"><table className="en"><thead><tr>{v.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{v.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
      )}
      {v.type === "process" && (
        <ol className="en" style={{ margin: 0, paddingLeft: "1.4rem" }}>
          {v.steps.map((s, i) => <li key={i} style={{ padding: "4px 0" }}>{s}{i < v.steps.length - 1 && <span aria-hidden className="muted"> ↓</span>}</li>)}
        </ol>
      )}
      {v.type === "map" && (
        <div className="grid grid-2 en">
          {[v.before, v.after].map((side) => (
            <div key={side.label} className="card" style={{ marginBottom: 0 }}>
              <b>{side.label}</b>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>{side.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
      <p className="small muted" style={{ margin: "6px 0 0" }}>ข้อมูลสมมุติที่สร้างขึ้นเพื่อฝึก ไม่ใช่ข้อสอบจริง</p>
    </figure>
  );
}
