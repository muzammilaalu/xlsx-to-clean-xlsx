import { smartCSVsplit } from "./csvUtils.js";

export function parseAppliedTaxes(str = "") {
  str = String(str).replace(/^"|"$/g, "");

  if (!str.includes(";")) return {};

  const [keys, values] = str.split(";");
  const keyArr = keys.split(",");
  const valArr = smartCSVsplit(values);

  const out = {};

  keyArr.forEach((k, i) => {
    out["applied_taxes_" + k.trim()] = (valArr[i] || "").trim();
  });

  return out;
}