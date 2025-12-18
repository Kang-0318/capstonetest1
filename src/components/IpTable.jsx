import React, { useEffect, useState } from "react";
import "./IpTable.css";

export default function IpTable() {
  const [networkData, setNetworkData] = useState({ ip: "", raw: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("offline"); // online | offline
  const [error, setError] = useState("");

  // ⚠️ 중요: Rocky Linux의 실제 IP로 수정하세요
  const VM_IP = "192.168.163.132"; 
  const BASE_URL = `http://${VM_IP}:4000`;

  const fetchNetworkInfo = async () => {
    setLoading(true);
    setError("");
    try {
      // 타임아웃 5초 설정
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${BASE_URL}/api/ip`, { signal: controller.signal });
      clearTimeout(id);

      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      setNetworkData(data);
      setStatus("online");
    } catch (err) {
      console.error(err);
      setError("리눅스 서버에 연결할 수 없습니다. (방화벽이나 IP를 확인하세요)");
      setStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  return (
    <div className="network-dashboard" style={{ padding: "20px", color: "#fff", minHeight: "100vh", backgroundColor: "#0f172a" }}>
      {/* 상단 헤더 및 상태 배지 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>Linux Network Monitor</h2>
          <p style={{ margin: "5px 0 0", opacity: 0.5, fontSize: "14px" }}>Real-time IP Tracking from VMware</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "15px", backgroundColor: "#1e293b", padding: "10px 20px", borderRadius: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: status === "online" ? "#4ade80" : "#ef4444",
              boxShadow: status === "online" ? "0 0 10px #4ade80" : "0 0 10px #ef4444",
              display: "inline-block"
            }}></span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: status === "online" ? "#4ade80" : "#ef4444" }}>
              {status.toUpperCase()}
            </span>
          </div>
          <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
          <button 
            onClick={fetchNetworkInfo} 
            disabled={loading}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#60a5fa", 
              cursor: "pointer", 
              fontSize: "13px", 
              fontWeight: "bold",
              padding: 0
            }}
          >
            {loading ? "REFRESHING..." : "REFRESH"}
          </button>
        </div>
      </div>

      {/* Main Card: 추출된 IP 주소 */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        padding: "60px 20px",
        borderRadius: "24px",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        marginBottom: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* 배경 장식용 효과 */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(96,165,250,0.05)", borderRadius: "50%", filter: "blur(50px)" }}></div>
        
        <p style={{ margin: 0, opacity: 0.4, fontSize: "12px", letterSpacing: "3px", fontWeight: "bold" }}>SERVER IP ADDRESS</p>
        <h1 style={{ 
          fontSize: "72px", 
          margin: "20px 0", 
          color: "#fff", 
          fontWeight: "800",
          textShadow: "0 0 30px rgba(96,165,250,0.2)",
          fontFamily: "monospace"
        }}>
          {networkData.ip || "---.---.---.---"}
        </h1>
        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "10px 20px", borderRadius: "8px", display: "inline-block" }}>
            <p style={{ color: "#f87171", fontSize: "14px", margin: 0 }}>{error}</p>
          </div>
        )}
      </div>

      {/* Raw Data Section: 터미널 스타일 */}
      <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h4 style={{ margin: 0, fontSize: "14px", opacity: 0.7, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🐚</span> Linux Console Output (ip a)
          </h4>
          <span style={{ fontSize: "11px", opacity: 0.3, fontFamily: "monospace" }}>UTF-8 ENCODING</span>
        </div>
        <div style={{
          background: "#000",
          color: "#4ade80", 
          padding: "20px",
          borderRadius: "12px",
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          height: "350px",
          overflowY: "auto",
          border: "1px solid #334155",
          whiteSpace: "pre-wrap",
          boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
        }}>
          {networkData.raw || "No data received. Click REFRESH to pull data from Linux."}
        </div>
      </div>
    </div>
  );
}
