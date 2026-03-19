import { smartCSVsplit } from "./csvUtils.js";
import { parseAppliedTaxes } from "./parseTaxes.js";

export function parseItems(data = "") {
  const rows = [];

  const parts = [];
  let cur = "";
  let inside = false;

  for (let ch of data) {
    if (ch === '"') inside = !inside;

    if (ch === ";" && !inside) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }

  if (cur.trim()) parts.push(cur);

  const headers = smartCSVsplit(parts[0]);

  for (let i = 1; i < parts.length; i++) {
    const line = parts[i];
    const cells = smartCSVsplit(line);

    let obj = {};

    headers.forEach((h, x) => {
      let v = cells[x] || "";

      if (h === "applied_taxes") {
        Object.assign(obj, parseAppliedTaxes(v));
      } else {
        obj[h] = v;
      }
    });

    rows.push(obj);
  }

  return rows;
}