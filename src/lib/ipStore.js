// src/lib/ipStore.js
const KEY = "ipRules:v1"; // [{ id, ip, label, status: "허용"|"차단" }]

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
  try { window.dispatchEvent(new CustomEvent("ipRulesChanged")); } catch {}
}

export function listRules() {
  return load();
}

export function addRule({ ip, label = "", status = "허용" }) {
  const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random());
  const item = { id, ip, label, status };
  const all = load();
  all.push(item);
  save(all);
  return item;
}

export function updateRule(id, { ip, label, status }) {
  const all = load();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Not found");
  all[idx] = { ...all[idx], ip, label, status };
  save(all);
  return all[idx];
}

export function removeRule(id) {
  const next = load().filter((r) => r.id !== id);
  save(next);
}

export function toggleStatus(id) {
  const rules = load();
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("대상을 찾을 수 없습니다.");
  rules[idx].status = rules[idx].status === "차단" ? "허용" : "차단";
  save(rules);
  return rules[idx];
}

export function findByIp(ip) {
  return load().find((r) => r.ip === ip);
}

export function findByLabel(label) {
  return load().find((r) => (r.label || "") === label);
}
