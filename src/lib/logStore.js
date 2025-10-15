const KEY = "logs:v1";

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
  try {
    window.dispatchEvent(new CustomEvent("logsChanged"));
  } catch {}
}

export function listLogs({ todayOnly=false } = {}) {
  const all = load();
  if (!todayOnly) return all.sort((a,b)=>b.at-a.at);
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return all.filter(l => l.at >= start.getTime() && l.at <= end.getTime())
            .sort((a,b)=>b.at-a.at);
}

export function addLog({ ip, reason="", status="allowed", label="" }) {
  const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()+Math.random());
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
