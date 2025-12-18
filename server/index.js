// 리눅스 서버용 IP 추출 API 서버
import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// 리눅스의 'ip a' 명령어 결과에서 실제 IP만 추출하는 API
app.get("/api/ip", (req, res) => {
  // ip a 명령어 실행
  exec("ip a", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "명령어 실행 실패", detail: String(err) });
    }

    // inet 뒤의 IPv4 주소를 찾는 정규표현식
    const ipRegex = /inet\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
    let match;
    const ips = [];

    while ((match = ipRegex.exec(stdout)) !== null) {
      const ip = match[1];
      // 127.0.0.1 (루프백)은 제외
      if (ip !== "127.0.0.1") {
        ips.push(ip);
      }
    }

    if (ips.length === 0) {
      return res.status(404).json({ 
        error: "실제 IP 주소를 찾지 못했습니다.", 
        raw: stdout 
      });
    }

    // 첫 번째 실제 IP 반환
    res.json({
      ip: ips[0],
      all_ips: ips,
      raw: stdout
    });
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Network Info Server running on port ${PORT}`);
});
