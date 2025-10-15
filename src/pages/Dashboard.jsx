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
    // 1) 규칙 중 차단 개수 (자동 차단된 IP 카드)
    const rules = listRules();
    const blocked = rules.filter(r => r.status === "blocked").length;
    setAutoBlockedCount(blocked);

    // 2) 오늘 탐지된 외부 접근 (오늘 날짜의 '차단' 로그 수)
    const today = listLogs({ todayOnly: true });
    const todayBlockedCount = today.filter(l => l.status === "blocked").length;
    setTodayBlocked(todayBlockedCount);

    // 3) 서버 상태 = 오직 'IP 접근 제어' 규칙만 기준 (로그와 무관)
    setServerStatus(blocked > 0 ? "비정상" : "정상");
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("ipRulesChanged", h);
    window.addEventListener("logsChanged", h); // 카드 수치(오늘 탐지된 외부 접근) 갱신용
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

      {/* ✅ 위치 변경: IP 접근 제어를 위로, 최근 활동 로그를 아래로 */}
      <IpTable />
      <LogList />
    </div>
  );
}
