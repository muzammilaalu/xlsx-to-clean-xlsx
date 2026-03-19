export function smartCSVsplit(str = "") {
  const out = [];
  let cur = "";
  let inside = false;

  for (let ch of str) {
    if (ch === '"') {
      inside = !inside;
      continue;
    }

    if (ch === "," && !inside) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }

  if (cur.trim()) out.push(cur.trim());
  return out;
}