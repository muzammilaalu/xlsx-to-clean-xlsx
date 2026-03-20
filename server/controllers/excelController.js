import XLSX from "xlsx";
import { parseItems } from "../utils/parseItems.js";

/* --------------------------------------------------
   Format Date → DD/MM/YYYY
-------------------------------------------------- */
function formatDate(value) {
  if (value === null || value === undefined || value === "") return value;

  // ✅ Date object — cellDates:true se milta hai
  if (value instanceof Date) {
    const day   = String(value.getUTCDate()).padStart(2, "0");
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const year  = value.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // ✅ Excel serial number fallback
  if (typeof value === "number" && value > 20000 && value < 60000) {
    const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(EXCEL_EPOCH.getTime() + value * 86400 * 1000);
    const day   = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year  = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // ✅ String date
  if (typeof value === "string") {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      const day   = String(parsed.getUTCDate()).padStart(2, "0");
      const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
      const year  = parsed.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return value;
}

const DATE_COLUMNS = ["documentdate", "datepaid", "lastupdated", "createddate"];

export const convertExcel = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("File missing");
    }

    const file = req.files.file;

    // ✅ cellDates:true — serial numbers ko Date objects mein convert karta hai
    const workbook = XLSX.read(file.data, {
      type: "buffer",
      cellDates: true,
    });

    // ✅ raw:true — Date objects milenge (string nahi)
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { raw: true, defval: "" }
    );

    let finalRows = [];

    sheet.forEach((row) => {
      let base = {};
      let items = [];

      Object.keys(row).forEach((key) => {
        let value = row[key];
        const lowerKey = key.toLowerCase();

        // ✅ Saare date columns format karo
        if (DATE_COLUMNS.includes(lowerKey)) {
          value = formatDate(value);
        }

        if (lowerKey === "items") {
          if (value && String(value).includes("code,description")) {
            items = parseItems(String(value));
          } else {
            items = [];
          }
          return;
        }

        base[key] = value;
      });

      if (Array.isArray(items) && items.length > 0) {
        items.forEach((it) => finalRows.push({ ...base, ...it }));
      } else {
        finalRows.push(base);
      }
    });

    /* ------------------------------------------------
       JSON → Excel output
    ------------------------------------------------ */
    const newSheet = XLSX.utils.json_to_sheet(finalRows);

    // ✅ Date columns ko string force karo — Excel phir number na banaye
    const headerRow = XLSX.utils.sheet_to_json(newSheet, { header: 1 })[0] || [];

    const dateColLetters = new Set(
      headerRow
        .map((h, i) => ({ letter: XLSX.utils.encode_col(i), h: String(h).toLowerCase() }))
        .filter((x) => DATE_COLUMNS.includes(x.h))
        .map((x) => x.letter)
    );

    Object.keys(newSheet).forEach((cell) => {
      if (!cell.match(/^[A-Z]+\d+$/)) return;
      const colLetter = cell.replace(/\d+$/, "");
      if (dateColLetters.has(colLetter) && newSheet[cell].v !== undefined) {
        newSheet[cell].t = "s";
        newSheet[cell].v = String(newSheet[cell].v);
        delete newSheet[cell].w;
        delete newSheet[cell].z;
      }
    });

    const newBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

    const buffer = XLSX.write(newBook, { type: "buffer", bookType: "xlsx" });

    // Filename
    let originalName = file.name || "uploaded-file.xlsx";
    const parts = originalName.split(".");
    parts.pop();
    const baseName = parts.join(".") || "converted-file";
    const outputName = `${baseName}-convert.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(outputName)}`
    );

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};