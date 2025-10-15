// src/lib/ipStore.js
// IP 규칙(허용/차단) 저장소 — localStorage 기반
// listRules / addRule / updateRule / removeRule / toggleStatus 제공

const KEY = "ipRules:v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // 규칙 변경 알림 → 대시보드/로그가 자동 갱신되도록 이벤트 발행
  try {
    window.dispatchEvent(new CustomEvent("ipRulesChanged"));
  } catch { }
}

export function listRules() {
  return load();
}

/** { ip, label?, status: 'allowed'|'blocked' } */
export function addRule({ ip, label = "", status = "allowed" }) {
  const rules = load();
  // 중복 IP 방지(원치 않으면 이 부분 삭제 가능)
  if (rules.some(r => r.ip === ip)) {
    throw new Error("이미 존재하는 IP입니다.");
  }
  const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  const rule = { id, ip, label, status, createdAt: Date.now() };
  rules.push(rule);
  save(rules);
  return rule;
}

/** 특정 id 항목 수정 (ip/label/status 일부만 patch) */
export function updateRule(id, patch) {
  const rules = load();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("대상을 찾을 수 없습니다.");
  rules[idx] = { ...rules[idx], ...patch };
  save(rules);
  return rules[idx];
}

/** 규칙 삭제 */
export function removeRule(id) {
  const next = load().filter(r => r.id !== id);
  save(next);
}

/** 허용↔차단 토글 */
export function toggleStatus(id) {
  const rules = load();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("대상을 찾을 수 없습니다.");
  rules[idx].status = rules[idx].status === "blocked" ? "allowed" : "blocked";
  save(rules);
  return rules[idx];
}
