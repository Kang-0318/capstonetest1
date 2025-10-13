import React from "react";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>🛡 보안 대시보드 </h1>
      <nav>
        <ul>
          <li><a href="#">대시보드</a></li>
          <li><a href="#">로그 보기</a></li>
          <li><a href="#">설정</a></li>
        </ul>
      </nav>
    </aside>
  );
}
