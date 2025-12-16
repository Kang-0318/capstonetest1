// 간단한 Node.js + Express 백엔드
// 리눅스(Rocky)에서 실행해서 서버 IP/네트워크 상태와 접속 IP 목록을 조회하는 API

import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// 1) 서버의 IP/인터페이스 정보 조회 (리눅스 ip 명령 사용)
app.get("/api/server-ip", (req, res) => {
  exec("ip -j addr", (err, stdout) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "ip 명령 실행 실패", detail: String(err) });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "ip 결과 파싱 실패", raw: stdout });
    }
  });
});

// 2) 현재 TCP 연결 목록 조회 (접속 IP 확인용)
app.get("/api/connections", (req, res) => {
  exec("ss -ntp", (err, stdout) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "ss 명령 실행 실패", detail: String(err) });
    }
    res.json({ raw: stdout });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});


