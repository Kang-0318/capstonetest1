import React from "react";
import LogList from "../components/LogList.jsx";
import TrafficCard from "../components/TrafficCard.jsx";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="cards">
        <TrafficCard title="오늘 탐지된 외부 접근" value="23건" color="#ffcc00" />
        <TrafficCard title="자동 차단된 IP" value="7개" color="#ff4444" />
        <TrafficCard title="서버 상태" value="정상" color="#00cc66" />
      </div>
      <div className="logs">
        <h2>실시간 차단 로그</h2>
        <LogList />
      </div>
    </div>
  );
}
