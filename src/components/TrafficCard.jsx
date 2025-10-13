import React from "react";

export default function TrafficCard({ title, value, color }) {
  return (
    <div className="card" style={{ borderLeft: `5px solid ${color}` }}>
      <p className="card-title">{title}</p>
      <p className="card-value">{value}</p>
    </div>
  );
}
