// 간단한 로컬 저장소 (나중에 API로 교체 쉬움)
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
}

export function listRules() {
  return load();
}

export function addRule({ ip, label = "", status = "allowed" }) {
  const rules = load();
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  // 중복 IP 방지(원하면 제거 가능)
  if (rules.some(r => r.ip === ip)) {
    throw new Error("이미 존재하는 IP입니다.");
  }
  const rule = { id, ip, label, status, createdAt: Date.now() };
  rules.push(rule);
  save(rules);
  return rule;
}

export function updateRule(id, patch) {
  const rules = load();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("대상을 찾을 수 없습니다.");
  rules[idx] = { ...rules[idx], ...patch };
  save(rules);
  return rules[idx];
}

export function removeRule(id) {
  const rules = load().filter(r => r.id !== id);
  save(rules);
}

export function toggleStatus(id) {
  const rules = load();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) throw new Error("대상을 찾을 수 없습니다.");
  rules[idx].status = rules[idx].status === "blocked" ? "allowed" : "blocked";
  save(rules);
  return rules[idx];
}
