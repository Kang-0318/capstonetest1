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
    const d = new Date(ts);
    const dstr = d.toLocaleDateString();
    const tstr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${dstr} ${tstr}`;
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>최근 활동 로그</h3>
        <button onClick={clearLogs} style={{background:'transparent',border:'1px solid #444',borderRadius:6,color:'#ccc',padding:'6px 10px'}}>로그 비우기</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>IP 주소</th>
            <th>시간</th>
            <th>사유</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={4} style={{textAlign:'center',padding:16,color:'#aaa'}}>기록이 없습니다.</td></tr>
          ) : logs.map(l => (
            <tr key={l.id}>
              <td>{l.ip}</td>
              <td>{fmt(l.at)}</td>
              <td>{l.reason || "-"}</td>
              <td style={{ color: l.status === "blocked" ? "#ff6666" : "#00cc66" }}>
                {l.status === "blocked" ? "차단" : "허용"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
