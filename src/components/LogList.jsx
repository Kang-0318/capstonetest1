import React from "react";

export default function LogList() {
  const logs = [
    { ip: "203.0.113.42", time: "19:22", reason: "다중 접속 탐지", status: "차단됨" },
    { ip: "192.168.0.14", time: "18:58", reason: "현재 IP주소", status: "허용" },
    { ip: "91.184.12.7", time: "18:32", reason: "포트스캔 시도", status: "차단됨" },
  ];

  return (
    <table className="log-table">
      <thead>
        <tr>
          <th>IP 주소</th>
          <th>시간</th>
          <th>사유</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, i) => (
          <tr key={i}>
            <td>{log.ip}</td>
            <td>{log.time}</td>
            <td>{log.reason}</td>
            <td className={log.status === "차단됨" ? "blocked" : "allowed"}>
              {log.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
