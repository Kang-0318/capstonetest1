// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import LogList from "../components/LogList.jsx";
import TrafficCard from "../components/TrafficCard.jsx";
import IpTable from "../components/IpTable.jsx";
import { listRules } from "../lib/ipStore";
import { listLogs } from "../lib/logStore";

export default function Dashboard() {
  const [autoBlockedCount, setAutoBlockedCount] = useState(0);
  const [todayBlocked, setTodayBlocked] = useState(0);
  const [serverStatus, setServerStatus] = useState("정상");

  const refresh = () => {
    // 1) 규칙 중 차단 개수 (자동 차단된 IP)
    const rules = listRules();
    const blockedCount = rules.filter((r) => r.status === "차단").length;
    setAutoBlockedCount(blockedCount);

    // 2) 서버 상태: 라벨이 '내아이피'인 규칙이 차단이면 비정상, 아니면 정상
    const selfRule = rules.find((r) => (r.label || "") === "내아이피");
    const status = selfRule && selfRule.status === "차단" ? "비정상" : "정상";
    setServerStatus(status);

    // 3) 오늘 탐지된 외부 접근: 오늘 날짜 & status === '차단' 인 로그 수
    const logs = listLogs();
    const blockedToday = logs.filter((l) => {
      const d = new Date(l.at);
      const now = new Date();
      const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      return sameDay && l.status === "차단";
    }).length;
    setTodayBlocked(blockedToday);
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("ipRulesChanged", h);
    window.addEventListener("logsChanged", h);
    return () => {
      window.removeEventListener("ipRulesChanged", h);
      window.removeEventListener("logsChanged", h);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="cards">
        <TrafficCard title="오늘 탐지된 외부 접근" value={`${todayBlocked}건`} color="#ffcc00" />
        <TrafficCard title="자동 차단된 IP" value={`${autoBlockedCount}개`} color="#ff4444" />
        <TrafficCard title="서버 상태" value={serverStatus} color={serverStatus === "정상" ? "#00cc66" : "#ff4444"} />
      </div>

      {/* IP 접근 제어 + 최근 로그 */}
      <IpTable />
      <LogList />
    </div>
  );
}
