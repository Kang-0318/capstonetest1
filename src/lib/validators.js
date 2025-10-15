// src/lib/validators.js
export function isValidIPv4(ip) {
  // 0.0.0.0 ~ 255.255.255.255
  return /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(ip);
}
