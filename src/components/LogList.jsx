// src/components/LogList.jsx
import React, { useEffect, useState } from "react";
import { listLogs, clearLogs } from "../lib/logStore";

export default function LogList() {
  const [logs, setLogs] = useState([]);

  const load = () => setLogs(listLogs());

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("logsChanged", h);
    window.addEventListener("ipRulesChanged", h);
    return () => {
      window.removeEventListener("logsChanged", h);
      window.removeEventListener("ipRulesChanged", h);
    };
  }, []);

  const fmt = (ts) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>최근 활동 로그</h3>
        <button className="btn-gray" onClick={() => { clearLogs(); load(); }}>로그 초기화</button>
      </div>
      <table className="log-table">
        <thead>
          <tr>
            <th>IP</th>
            <th>시각</th>
            <th>이벤트</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", opacity: 0.6 }}>로그가 없습니다.</td>
            </tr>
          )}
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{l.ip || "-"}</td>
              <td>{fmt(l.at)}</td>
              <td>{l.reason || "-"}</td>
              <td style={{ color: l.status === "차단" ? "#ff6666" : "#00cc66" }}>
                {l.status === "차단" ? "차단" : l.status === "허용" ? "허용" : l.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
