import React, { useEffect, useMemo, useState } from "react";
import { listRules, addRule, updateRule, removeRule, toggleStatus } from "../lib/ipStore";
import { isValidIPv4 } from "../lib/validators";
import "./IpTable.css"; // ✅ 스타일 분리 추가

export default function IpTable() {
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState({ ip: "", label: "", status: "allowed" });
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState("all");
    const [q, setQ] = useState("");

    useEffect(() => setRows(listRules()), []);

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            const okStatus = filter === "all" ? true : r.status === filter;
            const okQuery = !q
                ? true
                : (r.ip + " " + (r.label || "")).toLowerCase().includes(q.toLowerCase());
            return okStatus && okQuery;
        });
    }, [rows, filter, q]);

    const onAdd = (e) => {
        e.preventDefault();
        if (!isValidIPv4(form.ip)) {
            alert("올바른 IPv4 형식이 아닙니다.");
            return;
        }
        try {
            const created = addRule(form);
            setRows((prev) => [...prev, created]);
            setForm({ ip: "", label: "", status: "allowed" });
        } catch (err) {
            alert(err.message);
        }
    };

    const onSave = (id, patch) => {
        const updated = updateRule(id, patch);
        setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setEditing(null);
    };

    const onDelete = (id) => {
        if (!confirm("삭제하시겠습니까?")) return;
        removeRule(id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const onToggle = (id) => {
        const updated = toggleStatus(id);
        setRows((prev) => prev.map((r) => (r.id === id ? updated : r)));
    };

    return (
        <div className="ip-card">
            <div className="ip-header">
                <h3>🌐 IP 접근 제어</h3>
            </div>

            {/* 입력폼 */}
            <form className="ip-form" onSubmit={onAdd}>
                <input
                    type="text"
                    placeholder="예: 192.168.0.50"
                    value={form.ip}
                    onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value.trim() }))}
                />
                <input
                    type="text"
                    placeholder="라벨(선택)"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
                <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                    <option value="allowed">허용</option>
                    <option value="blocked">차단</option>
                </select>
                <button type="submit" className="btn-add">추가</button>
            </form>

            {/* 필터 & 검색 */}
            <div className="ip-filter">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">전체</option>
                    <option value="allowed">허용</option>
                    <option value="blocked">차단</option>
                </select>
                <input
                    placeholder="검색 (IP / 라벨)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            {/* 리스트 */}
            <table className="ip-table">
                <thead>
                    <tr>
                        <th>IP</th>
                        <th>라벨</th>
                        <th>상태</th>
                        <th>작업</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr><td colSpan={4} className="empty">데이터가 없습니다.</td></tr>
                    ) : (
                        filtered.map((r) => (
                            <tr key={r.id} className={r.status === "blocked" ? "blocked-row" : ""}>
                                <td>{editing === r.id ? (
                                    <input defaultValue={r.ip} onBlur={(e) => onSave(r.id, { ip: e.target.value })} />
                                ) : r.ip}</td>
                                <td>{editing === r.id ? (
                                    <input defaultValue={r.label} onBlur={(e) => onSave(r.id, { label: e.target.value })} />
                                ) : (r.label || "-")}</td>
                                <td>
                                    <span className={`badge ${r.status === "blocked" ? "badge-red" : "badge-green"}`}>
                                        {r.status === "blocked" ? "차단" : "허용"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-group">
                                        {editing === r.id ? (
                                            <button className="btn-gray" onClick={() => setEditing(null)}>완료</button>
                                        ) : (
                                            <button className="btn-gray" onClick={() => setEditing(r.id)}>편집</button>
                                        )}
                                        <button
                                            className={r.status === "blocked" ? "btn-green" : "btn-red"}
                                            onClick={() => onToggle(r.id)}
                                        >
                                            {r.status === "blocked" ? "허용 전환" : "차단 전환"}
                                        </button>
                                        <button className="btn-delete" onClick={() => onDelete(r.id)}>삭제</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
