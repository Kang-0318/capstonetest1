// src/components/IpTable.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listRules, addRule, updateRule, removeRule, toggleStatus, findByIp, findByLabel } from "../lib/ipStore";
import { isValidIPv4 } from "../lib/validators"; // 프로젝트에 이미 있다면 그대로 사용
import { addLog, listLogs } from "../lib/logStore";
import "./IpTable.css";
import ServerEventModal from "./ServerEventModal";

export default function IpTable() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ip: "", label: "", status: "허용" });
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [myIp, setMyIp] = useState("");

  // 상단 고정 배너
  const [banner, setBanner] = useState({ open: false, text: "", level: "info" });

  // 모달 & 마지막 관리자 정보
  const [modalOpen, setModalOpen] = useState(false);
  const [lastAdmin, setLastAdmin] = useState(null);

  const load = () => setRows(listRules());

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("ipRulesChanged", h);
    window.addEventListener("logsChanged", h);
    return () => {
      window.removeEventListener("ipRulesChanged", h);
      window.removeEventListener("logsChanged", h);
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "허용" && r.status !== "허용") return false;
      if (filter === "차단" && r.status !== "차단") return false;
      if (q && !(r.ip.includes(q) || (r.label || "").includes(q))) return false;
      return true;
    });
  }, [rows, filter, q]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onAdd(e) {
    e && e.preventDefault();
    if (!isValidIPv4(form.ip)) {
      alert("유효한 IPv4를 입력하세요");
      return;
    }
    const exists = findByIp(form.ip);
    if (exists) {
      alert("이미 등록된 IP입니다.");
      return;
    }
    addRule({ ip: form.ip, label: form.label, status: form.status });
    addLog({ ip: form.ip, reason: "수동 추가", status: form.status, label: form.label });
    setForm({ ip: "", label: "", status: "허용" });
    load();
  }

  function onEdit(r) {
    setEditing(r.id);
    setForm({ ip: r.ip, label: r.label, status: r.status });
  }

  function onSaveEdit() {
    try {
      if (!isValidIPv4(form.ip)) {
        alert("유효한 IPv4를 입력하세요");
        return;
      }
      updateRule(editing, { ip: form.ip, label: form.label, status: form.status });
      addLog({ ip: form.ip, reason: "수정", status: form.status, label: form.label });
      setEditing(null);
      setForm({ ip: "", label: "", status: "허용" });
      load();
    } catch (err) {
      alert(err.message || err);
    }
  }

  function onDelete(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    removeRule(id);
    addLog({ ip: "", reason: "삭제: " + id, status: "info" });
    load();
  }

  function onToggle(id) {
    const r = toggleStatus(id); // "허용" <-> "차단"
    addLog({ ip: r.ip, reason: r.status === "차단" ? "차단" : "허용", status: r.status, label: r.label });
    load();
  }

  // 상단 고정 배너 유틸
  function showBanner(text, level = "info", ms = 5000) {
    setBanner({ open: true, text, level });
    if (ms > 0) {
      setTimeout(() => setBanner((b) => ({ ...b, open: false })), ms);
    }
  }

  // 서버 상태 비정상: 내아이피(라벨) 규칙이 '차단'일 때만 작동
  function triggerServerAbnormal() {
    const self = findByLabel("내아이피");
    if (!self) {
      showBanner(" '내IP' 라벨이 없습니다. 먼저 내아이피를 등록해 주세요.", "warn");
      return;
    }
    if (self.status !== "차단") {
      showBanner(" 내 IP가 '차단' 상태에서만 비정상 admin변환이 작동합니다.", "info");
      return;
    }

    // 랜덤 비밀번호 & 랜덤 IP 생성
    const pw = Math.random().toString(36).slice(2, 12);
    const ip = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(
      Math.random() * 255
    )}.${Math.floor(Math.random() * 255)}`;
    const admin = { password: pw, ip, at: Date.now() };
    setLastAdmin(admin);

    // '내아이피' 규칙의 IP를 랜덤 IP로 덮어쓰기 (상태는 기존대로 '차단' 유지)
    try {
      updateRule(self.id, { ip, label: self.label, status: self.status });
      addLog({ ip, reason: "서버 비정상 - 어드민 정보 랜덤화 & 내아이피 갱신", status: "warn", label: "admin" });
      load();
    } catch (e) {
      console.error(e);
    }

    // 상단 배너 + 모달
    showBanner(` 서버 비정상 외부IP 접근 감지 — 어드민 암호/IP 갱신됨 (임시 IP: ${ip})`, "error", 8000);
    setModalOpen(true);

  }

  // '내아이피 등록' 버튼 동작
  function registerMyIp() {
    if (!isValidIPv4(myIp)) {
      alert("유효한 IPv4를 입력하세요");
      return;
    }
    const exists = findByIp(myIp);
    if (exists) {
      alert("이미 등록되어 있습니다.");
      return;
    }
    addRule({ ip: myIp, label: "내아이피", status: "허용" });
    addLog({ ip: myIp, reason: "내아이피 등록", status: "허용", label: "내아이피" });
    setMyIp("");
    load();
    showBanner(" 내아이피가 등록되었습니다.", "success");
  }

  return (
    <div className="ip-card">
      {/* 상단 고정 배너 */}
      {banner.open && (
        <div
          className={`top-banner ${banner.level}`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: "10px 14px",
            textAlign: "center",
          }}
        >
          {banner.text}
        </div>
      )}

      <div className="ip-header" style={{ marginTop: banner.open ? 40 : 0 }}>
        <h3>IP 접근 제어</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="내 IP 입력 (예: 203.0.113.5)"
            value={myIp}
            onChange={(e) => setMyIp(e.target.value)}
            className="myip-input"
          />
          <button className="btn-gray" onClick={registerMyIp}>
            내아이피 등록
          </button>
        </div>
      </div>

      <form className="ip-form" onSubmit={onAdd}>
        <input name="ip" value={form.ip} onChange={onChange} placeholder="IP (예: 192.168.0.1)" />
        <input name="label" value={form.label} onChange={onChange} placeholder="라벨 (예: 공용망)" />
        <select name="status" value={form.status} onChange={onChange}>
          <option value="허용">허용</option>
          <option value="차단">차단</option>
        </select>
        {editing ? (
          <>
            <button type="button" className="btn-green" onClick={onSaveEdit}>
              저장
            </button>
            <button
              type="button"
              className="btn-gray"
              onClick={() => {
                setEditing(null);
                setForm({ ip: "", label: "", status: "허용" });
              }}
            >
              취소
            </button>
          </>
        ) : (
          <button type="submit" className="btn-green">
            추가
          </button>
        )}
      </form>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <label>필터:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="허용">허용</option>
          <option value="차단">차단</option>
        </select>
        <input placeholder="검색 (IP 또는 라벨)" value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ flex: 1 }} />
        <button className="btn-red" onClick={triggerServerAbnormal}>
          서버 상태 → 비정상(테스트)
        </button>
      </div>

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="ip-table">
          <thead>
            <tr>
              <th>IP</th>
              <th>라벨</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.ip}</td>
                <td>{r.label}</td>
                <td>
                  <span className={"badge " + (r.status === "허용" ? "badge-green" : "badge-red")}>{r.status}</span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn-gray" onClick={() => onEdit(r)}>
                      수정
                    </button>
                    <button className="btn-gray" onClick={() => onToggle(r.id)}>
                      {r.status === "차단" ? "허용 전환" : "차단 전환"}
                    </button>
                    <button className="btn-delete" onClick={() => onDelete(r.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", opacity: 0.7 }}>
                  등록된 항목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>최근 이벤트 로그</h4>
        <LogBox />
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>마지막으로 생성된 admin 정보</h4>
        {lastAdmin ? (
          <div className="admin-box">
            <div>
              <strong>새 암호:</strong> {lastAdmin.password}
            </div>
            <div>
              <strong>새 관리자 IP:</strong> {lastAdmin.ip}
            </div>
            <div>
              <strong>발생시각:</strong> {new Date(lastAdmin.at).toLocaleString()}
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.6 }}>아직 생성된 정보가 없습니다.</div>
        )}
      </div>

      <ServerEventModal open={modalOpen} admin={lastAdmin} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function LogBox() {
  const [logs, setLogs] = React.useState([]);
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("logsChanged", h);
    return () => window.removeEventListener("logsChanged", h);
    // eslint-disable-next-line
  }, []);
  function load() {
    setLogs(listLogs().slice(-8).reverse());
  }

  

  return (
    <div style={{ maxHeight: 180, overflow: "auto", background: "#0f1720", padding: 10, borderRadius: 8 }}>
      {logs.length === 0 && <div style={{ opacity: 0.6 }}>로그가 없습니다.</div>}
      {logs.map((l) => (
        <div key={l.id} style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {new Date(l.at).toLocaleString()} — <strong>{l.status}</strong>
          </div>
          <div style={{ fontSize: 14 }}>{l.ip || "-"} • {l.label || ""} • {l.reason}</div>
        </div>
      ))}
    </div>
  );
}
