// src/components/ServerEventModal.jsx
import React from "react";
import "./IpTable.css";

export default function ServerEventModal({ open, onClose, admin }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>서버 비정상 접근 발생</h3>
        <p>어드민 계정 및 IP가 긴급으로 재생성되었습니다.</p>
        <div className="modal-body">
          <div><strong>관리자명:</strong> admin</div>
          <div><strong>새 암호:</strong> {admin?.password}</div>
          <div><strong>새 관리자 IP:</strong> {admin?.ip}</div>
          <div><strong>발생시각:</strong> {new Date(admin?.at).toLocaleString()}</div>
        </div>
        <div className="modal-actions">
          <button className="btn-green" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
