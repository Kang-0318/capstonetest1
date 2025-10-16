// src/lib/logStore.js
const KEY = "logs:v1"; // [{ id, ip, label, reason, status, at }]

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
  try { window.dispatchEvent(new CustomEvent("logsChanged")); } catch {}
}

export function listLogs() {
  return load();
}

export function addLog({ ip, reason = "", status = "info", label = "" }) {
  const id = (crypto?.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random());
  const at = Date.now();
  const entry = { id, ip, label, reason, status, at };
  const all = load();
  all.push(entry);
  save(all);
  return entry;
}

export function clearLogs() {
  save([]);
}
