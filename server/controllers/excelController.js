import XLSX from "xlsx";
import { parseItems } from "../utils/parseItems.js";

/* --------------------------------------------------
   Format Date → DD/MM/YYYY
-------------------------------------------------- */
function formatDate(value) {
  if (!value) return value;

  if (typeof value === "number") {
    const utc_days = Math.floor(value - 25569);
    const date = new Date(utc_days * 86400 * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  if (typeof value === "string") {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!isNaN(parsed)) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  return value;
}

export const convertExcel = (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).send("File missing");
    }

    const file = req.files.file;

    const workbook = XLSX.read(file.data);

    // 🔥 raw: false → dates as strings
    const sheet = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      { raw: false, dateNF: "dd/mm/yyyy" }
    );

    let finalRows = [];

    sheet.forEach((row) => {
      let base = {};
      let items = [];

      Object.keys(row).forEach((key) => {
        let value = row[key];
        const lowerKey = key.toLowerCase();

        // 🔥 DocumentDate fix
        if (lowerKey === "documentdate") {
          value = formatDate(value);
        }

        if (lowerKey === "items") {
          if (value && String(value).includes("code,description")) {
            items = parseItems(value);
          } else {
            items = [];
          }
          return;
        }

        if (
          lowerKey !== "items" &&
          typeof value === "string" &&
          value.includes(";") &&
          value.includes(",")
        ) {
          base[key] = value;
          return;
        }

        base[key] = value;
      });

      if (Array.isArray(items) && items.length > 0) {
        items.forEach((it) => {
          finalRows.push({ ...base, ...it });
        });
      } else {
        finalRows.push(base);
      }
    });

    // 🔥 cellDates: false → date wapas number na bane
    const newSheet = XLSX.utils.json_to_sheet(finalRows, { cellDates: false });
    const newBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newBook, newSheet, "Cleaned");

    const buffer = XLSX.write(newBook, { type: "buffer", bookType: "xlsx" });

    // Filename
    let originalName = file.name || "uploaded-file.xlsx";
    const parts = originalName.split(".");
    const ext = parts.pop() || "xlsx";
    const baseName = parts.join(".") || "converted-file";
    const outputName = `${baseName}-convert.${ext}`;

    // 🔥 FIX 1 — Content-Type add kiya
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // 🔥 FIX 2 — UTF-8 filename encoding
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